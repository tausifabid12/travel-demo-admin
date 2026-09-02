"use client";

import { useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { toast } from "@/components/ui";

interface PushNotificationManagerProps {
  configStr?: string | null;
}

export function PushNotificationManager({ configStr }: PushNotificationManagerProps) {
  useEffect(() => {
    if (!configStr) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    let config;
    try {
      config = JSON.parse(configStr);
    } catch (e) {
      console.error("Invalid Firebase Client Config");
      return;
    }

    const requestPermissionAndRegister = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const app = initializeApp(config);
          const messaging = getMessaging(app);

          // Get the VAPID key from config if available, otherwise just use getToken
          const vapidKey = config.vapidKey; // You can add vapidKey to the client config JSON

          const token = await getToken(messaging, { vapidKey });
          if (token) {
            // Register token with the backend
            await fetch("/api/notifications/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });

            // Listen for foreground messages
            onMessage(messaging, (payload) => {
              toast(payload.notification?.title || "New Notification");
            });
          }
        }
      } catch (err) {
        console.error("Failed to setup push notifications", err);
      }
    };

    // If permission is already granted or default, we can try to request/register
    if (Notification.permission !== "denied") {
      requestPermissionAndRegister();
    }
  }, [configStr]);

  return null;
}
