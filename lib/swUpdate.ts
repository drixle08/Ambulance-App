// Shared, module-level store for service worker update state. It lives
// outside React so the "update available" signal survives navigation
// between the global registration effect (mounted once in the root layout)
// and any dashboard-only banner that reads it.

type Listener = () => void;

let registration: ServiceWorkerRegistration | null = null;
let waitingWorker: ServiceWorker | null = null;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function setRegistration(reg: ServiceWorkerRegistration) {
  registration = reg;
}

export function setWaitingWorker(worker: ServiceWorker | null) {
  if (waitingWorker === worker) return;
  waitingWorker = worker;
  emit();
}

export function getWaitingWorker(): ServiceWorker | null {
  return waitingWorker;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Ask the browser to check for a new service worker script. Cheap no-op if
// there's nothing new; safe to call opportunistically (e.g. on foreground).
export function checkForUpdate() {
  registration?.update().catch(() => {
    // Ignore — typically offline, which is expected in the field.
  });
}

// Tell the waiting worker to activate, then reload once it takes control.
export function applyUpdate() {
  const worker = waitingWorker;
  if (!worker || typeof navigator === "undefined" || !navigator.serviceWorker) {
    return;
  }

  navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => window.location.reload(),
    { once: true }
  );

  worker.postMessage({ type: "SKIP_WAITING" });
}
