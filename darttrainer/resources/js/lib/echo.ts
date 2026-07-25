import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

type AppEcho = Echo<'pusher'>;

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo?: AppEcho;
    }
}

export function createEcho(): AppEcho | null {
    const key = import.meta.env.VITE_PUSHER_APP_KEY;

    if (!key) {
        return null;
    }

    window.Pusher = Pusher;

    const cluster = String(import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1');

    return new Echo({
        broadcaster: 'pusher',
        key: String(key),
        cluster,
        wsHost: String(import.meta.env.VITE_PUSHER_HOST ?? `ws-${cluster}.pusher.com`),
        wsPort: Number(import.meta.env.VITE_PUSHER_PORT ?? 80),
        wssPort: Number(import.meta.env.VITE_PUSHER_PORT ?? 443),
        forceTLS: String(import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        authorizer: (channel) => ({
            authorize: (socketId, callback) => {
                fetch('/broadcasting/auth', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name,
                    }),
                })
                    .then((response) => response.json())
                    .then((data) => callback(null, data))
                    .catch((error: unknown) => {
                        callback(error instanceof Error ? error : new Error(String(error)), null);
                    });
            },
        }),
    });
}

export function getEcho(): AppEcho | null {
    if (!window.Echo) {
        window.Echo = createEcho() ?? undefined;
    }

    return window.Echo ?? null;
}
