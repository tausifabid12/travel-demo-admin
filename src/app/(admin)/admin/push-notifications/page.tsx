"use client";

import { useState } from "react";
import { PageHeader, Card, Field, Input, Textarea, Button, toast } from "@/components/ui";
import { Send, BookOpen } from "lucide-react";

export default function PushNotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send");
      toast(`Notification sent to ${data.successCount} users`);
      setTitle("");
      setBody("");
      setUrl("");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Push Notifications"
        description="Send desktop and mobile push notifications to all subscribed users."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-admin-text-primary mb-4 flex items-center gap-2">
              <Send className="size-5 text-brand" /> Send a Broadcast
            </h2>
            <form onSubmit={sendNotification} className="flex flex-col gap-4">
              <Field label="Notification Title" required>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Flash Sale on Bali Packages!"
                  required
                />
              </Field>

              <Field label="Notification Body" required>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Get 20% off all luxury retreats. Book before Friday."
                  required
                  rows={3}
                />
              </Field>

              <Field label="Target URL (Optional)" hint="Where the user is taken when they click">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourdomain.com/destinations/bali"
                />
              </Field>

              <div className="pt-2">
                <Button type="submit" loading={loading} className="w-full">
                  Broadcast to all subscribers
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div>
          <Card className="p-6 bg-admin-surface-hover/50">
            <h2 className="text-lg font-semibold text-admin-text-primary mb-4 flex items-center gap-2">
              <BookOpen className="size-5 text-leaf" /> Setup Guide
            </h2>
            <div className="prose prose-sm max-w-none text-admin-text-secondary">
              <p>
                To enable desktop push notifications, you must configure Google Firebase in your Admin Settings.
              </p>
              <ol className="list-decimal pl-4 space-y-2 mt-4">
                <li>
                  Go to the <strong>Firebase Console</strong> and create a new project.
                </li>
                <li>
                  Navigate to <strong>Project Settings</strong> &gt; <strong>Service Accounts</strong>.
                </li>
                <li>
                  Click <strong>Generate new private key</strong>. This will download a JSON file.
                </li>
                <li>
                  Open the downloaded JSON file. Copy its entire contents.
                </li>
                <li>
                  Go to <strong>Settings</strong> &gt; <strong>Integrations</strong> in this admin panel.
                </li>
                <li>
                  Paste the JSON into the <strong>Firebase Service Account JSON</strong> field.
                </li>
                <li>
                  Save your settings. The public Firebase Config will be automatically injected into your site's frontend for users to subscribe.
                </li>
              </ol>
              <div className="mt-6 rounded-md bg-blue-50 p-4 border border-blue-100">
                <p className="text-blue-800 font-medium text-sm">How it works</p>
                <p className="text-blue-700 text-xs mt-1">
                  When a user visits the site, their browser will ask for notification permissions. If they accept, an FCM token is saved to their profile. When you broadcast a message here, it goes to all active FCM tokens.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
