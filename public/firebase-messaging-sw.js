importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// To receive background messages, we would normally initialize firebase here
// However, since we don't have the config injected into this file statically,
// this is a placeholder. You can dynamically pass the config or generate this file
// if you have it. For now, this fulfills the service worker requirement for FCM.

self.addEventListener('push', function(event) {
  if (event.data) {
    const payload = event.data.json();
    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
      body: payload.notification?.body,
      icon: payload.notification?.icon || '/icon.png',
      data: payload.webpush?.fcmOptions?.link || '/',
    };

    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});
