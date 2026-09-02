import Setting from "@/lib/models/Setting";
import { PinggoService } from "@/lib/pinggo";

type Notification = {
  subject: string;
  lines: string[];
  audience: "enquiry" | "careers";
};

async function sendEmail(to: string[], subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM_EMAIL;
  if (!apiKey || !from || to.length === 0) return;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  });

  if (!res.ok) {
    console.error("Email notification failed", res.status, await res.text());
  }
}

/**
 * Notifies the recipients configured in Settings when something lands in the
 * inbox. Best-effort: a failure here must never fail the visitor's submission.
 */
export async function notifyTeam({ subject, lines, audience }: Notification) {
  try {
    const settings = await Setting.findOne({}).lean<{
      notifications?: {
        enquiryRecipients?: string[];
        careersRecipients?: string[];
        emailEnabled?: boolean;
        whatsappEnabled?: boolean;
      };
      pinggoApiKey?: string;
      pinggoUserId?: string;
      pinggoVendorPhone?: string;
      contact?: { whatsapp?: string };
    }>();

    if (!settings) return;
    const n = settings.notifications ?? {};
    const body = [subject, "", ...lines].join("\n");

    if (n.emailEnabled) {
      const to =
        audience === "careers"
          ? (n.careersRecipients ?? [])
          : (n.enquiryRecipients ?? []);
      await sendEmail(to, subject, body);
    }

    if (
      n.whatsappEnabled &&
      settings.pinggoApiKey &&
      settings.pinggoUserId &&
      settings.pinggoVendorPhone &&
      settings.contact?.whatsapp
    ) {
      const pinggo = new PinggoService(
        settings.pinggoApiKey,
        settings.pinggoUserId,
        settings.pinggoVendorPhone,
      );
      await pinggo.sendTextMessage(settings.contact.whatsapp, body);
    }
  } catch (err) {
    console.error("notifyTeam failed", err);
  }
}
