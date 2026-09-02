import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "Customer") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 });
    }

    await dbConnect();
    
    // Add token to customer if it doesn't already exist
    await Customer.findByIdAndUpdate(user.id, {
      $addToSet: { fcmTokens: token }
    });

    return NextResponse.json({ message: "Token registered successfully" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}
