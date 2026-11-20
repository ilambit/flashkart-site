// Plain Web Push handler: no Firebase SDK or config needed in the worker.
// FCM tokens are still created in the page (src/utils/firebase.ts) and this
// worker only receives the resulting push events.

self.addEventListener('push', (event) => {
    if (!event.data) return;

    let payload;
    try {
        payload = event.data.json();
    } catch {
        return;
    }
    const notification = payload.notification || {};
    const data = payload.data || {};
    // Support notification messages and data-only messages.
    const title = notification.title || data.title;
    if (!title) return;

    const options = {
        body: notification.body || data.body,
        icon: notification.icon || data.icon || data.image || '/favicon.ico',
        data: { url: data.url || data.click_action || '/' },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Only same-origin targets are allowed; anything else falls back to the home page.
const resolveTargetUrl = (raw) => {
    try {
        const url = new URL(raw || '/', self.location.origin);
        return url.origin === self.location.origin ? url.href : self.location.origin + '/';
    } catch {
        return self.location.origin + '/';
    }
};

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = resolveTargetUrl(event.notification.data && event.notification.data.url);

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
            for (const client of clientsList) {
                const clientUrl = new URL(client.url);
                if (clientUrl.origin === self.location.origin && 'focus' in client) {
                    client.focus();
                    if ('navigate' in client) {
                        return client.navigate(targetUrl);
                    }
                    return;
                }
            }
            return self.clients.openWindow(targetUrl);
        })
    );
});
