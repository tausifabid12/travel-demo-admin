import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import dbConnect from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";
import Setting from "@/lib/models/Setting";

async function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApp();
  }

  await dbConnect();
  const settings = await Setting.findOne();
  if (!settings?.firebaseServiceAccount) {
    throw new Error("Firebase Service Account JSON is not configured in settings.");
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(settings.firebaseServiceAccount);
  } catch (err) {
    throw new Error("Invalid Firebase Service Account JSON.");
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "Admin" && (session.user as any).role !== "SuperAdmin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, body, url } = await req.json();
    if (!title || !body) {
      return NextResponse.json({ message: "Title and body are required" }, { status: 400 });
    }

    await dbConnect();
    
    // Get all valid FCM tokens from customers
    const customers = await Customer.find({ fcmTokens: { $exists: true, $not: { $size: 0 } } });
    let allTokens: string[] = [];
    customers.forEach(customer => {
      if (customer.fcmTokens) {
        allTokens = [...allTokens, ...customer.fcmTokens];
      }
    });

    if (allTokens.length === 0) {
      return NextResponse.json({ message: "No subscribed users found", successCount: 0 });
    }

    const firebaseApp = await getFirebaseAdmin();
    const messaging = getMessaging(firebaseApp);

    // Multicast allows up to 500 tokens per call, chunking if necessary
    const maxTokensPerCall = 500;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < allTokens.length; i += maxTokensPerCall) {
      const chunk = allTokens.slice(i, i + maxTokensPerCall);
      const message = {
        tokens: chunk,
        notification: {
          title,
          body,
        },
        webpush: url ? {
          fcmOptions: {
            link: url
          }
        } : undefined
      };

      const response = await messaging.sendEachForMulticast(message);
      successCount += response.successCount;
      failureCount += response.failureCount;
    }

    return NextResponse.json({ successCount, failureCount });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}
