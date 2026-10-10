import { AppState, AppStateStatus } from 'react-native';

const RENDER_HEALTH_URL = 'https://sensoo-app-final-2.onrender.com/api/v1/health';
const PING_INTERVAL_MS = 8 * 60 * 1000; // 8 minutes (Render sleeps after 15 minutes of inactivity)

let keepAliveTimer: ReturnType<typeof setInterval> | null = null;
let isStarted = false;

async function pingRender(): Promise<void> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(RENDER_HEALTH_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Sensoo-Ping': 'KeepAlive',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      console.log('⚡ [Sensoo KeepAlive] Render backend ping successful (awake & hot)');
    }
  } catch (err) {
    // Non-blocking ping failure is swallowed gracefully
    console.log('⚡ [Sensoo KeepAlive] Ping sent to wake Render');
  }
}

/**
 * Starts continuous, persistent pinging to keep Render backend always awake and avoid cold starts.
 * Pings immediately on launch, every 8 minutes on interval, and whenever app returns to foreground.
 */
export function startRenderKeepAlive(): void {
  if (isStarted) return;
  isStarted = true;

  // 1. Immediate initial wake-up ping
  pingRender();

  // 2. Set recurring 8-minute interval
  if (keepAliveTimer) clearInterval(keepAliveTimer);
  keepAliveTimer = setInterval(pingRender, PING_INTERVAL_MS);

  // 3. Ping on app state transitions (e.g. user returns to app)
  AppState.addEventListener('change', (nextState: AppStateStatus) => {
    if (nextState === 'active') {
      pingRender();
    }
  });
}
