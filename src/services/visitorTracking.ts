import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_zijppum";
const TEMPLATE_ID = "template_bfaicga";
const PUBLIC_KEY = "oiGY-u7t8BC8uN_Zf";

/** Visitor information sent with the automatic page-load notification. */
export interface VisitorInfo {
  time: string;
  page: string;
  ip: string;
  browser: string;
  language: string;
  screen: string;
  timezone: string;
  referrer: string;
  platform: string;
}

export async function sendVisitorEmail() {
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return;
  }

  if (window.location.pathname.startsWith("/dev")) {
    return;
  }

  try {
    const ipData = await fetch("https://api.ipify.org?format=json").then(r =>
      r.json()
    );

    await emailjs.send(
      "service_zijppum",
      "template_bfaicga",
      {
        time: new Date().toLocaleString(),
        page: window.location.href,
        ip: ipData.ip,
        browser: navigator.userAgent,
        language: navigator.language,
        screen: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer || "Direct",
        platform: navigator.platform,
      },
      "oiGY-u7t8BC8uN_Zf"
    );

    console.log("Visitor email sent");
  } catch (err) {
    console.error("Email failed:", err);
  }
}

/* ------------------------------------------------------------------ */
/* Duplicate prevention                                                */
/* ------------------------------------------------------------------ */

const VISITOR_SESSION_KEY = "studifree:visitor-email-sent";

/**
 * Pure guard used instead of reading window directly so the rules can be
 * tested. Deployment only: localhost and /dev routes are excluded.
 */
export function isTrackingAllowed(hostname: string, pathname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") return false;
  if (pathname.startsWith("/dev")) return false;
  return true;
}

/**
 * Send the visitor notification at most once per browser session.
 * Called outside React rendering, so StrictMode cannot duplicate it.
 */
export function initVisitorTracking(): void {
  if (typeof window === "undefined") return;
  if (!isTrackingAllowed(window.location.hostname, window.location.pathname)) return;

  try {
    if (sessionStorage.getItem(VISITOR_SESSION_KEY)) return;
    // Mark before sending so a retry/re-render can never duplicate the email.
    sessionStorage.setItem(VISITOR_SESSION_KEY, "1");
  } catch {
    // Storage unavailable (private mode): fall through once per page load.
  }

  const run = () => {
    void sendVisitorEmail();
  };

  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
  if (typeof idle === "function") idle(run, { timeout: 3000 });
  else window.setTimeout(run, 900);
}

/* ------------------------------------------------------------------ */
/* Optional location sharing                                           */
/* ------------------------------------------------------------------ */

export type LocationConsent = "granted" | "declined";

const LOCATION_CONSENT_KEY = "studifree:location-consent";

/** Window event dispatched when the learner resets their choice in Settings. */
export const LOCATION_CONSENT_RESET_EVENT = "studifree:location-consent-reset";

export function getLocationConsent(): LocationConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(LOCATION_CONSENT_KEY);
    return value === "granted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}

export function setLocationConsent(value: LocationConsent): void {
  try {
    localStorage.setItem(LOCATION_CONSENT_KEY, value);
  } catch {
    /* ignore */
  }
}

export function clearLocationConsent(): void {
  try {
    localStorage.removeItem(LOCATION_CONSENT_KEY);
  } catch {
    /* ignore */
  }
}

/** Collect the shared visitor fields once, without sending anything. */
export async function collectVisitorInfo(): Promise<VisitorInfo> {
  let ip = "Unavailable";
  try {
    const data = await fetch("https://api.ipify.org?format=json").then((r) => r.json());
    if (data?.ip) ip = String(data.ip);
  } catch {
    /* IP is helpful but never required */
  }

  return {
    time: new Date().toLocaleString(),
    page: window.location.href,
    ip,
    browser: navigator.userAgent,
    language: navigator.language,
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer || "Direct",
    platform: navigator.platform,
  };
}

/**
 * Separate notification sent only after the visitor explicitly clicks
 * "Allow location". Never call this without consent.
 */
export async function sendLocationEmail(coords: {
  latitude: number;
  longitude: number;
  accuracy: number;
}): Promise<boolean> {
  if (getLocationConsent() !== "granted") return false;

  try {
    const info = await collectVisitorInfo();
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        ...info,
        location: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
        latitude: coords.latitude.toFixed(5),
        longitude: coords.longitude.toFixed(5),
        location_accuracy: `${Math.round(coords.accuracy)} m`,
        consent: "Granted — explicit consent",
      },
      PUBLIC_KEY,
    );
    return true;
  } catch (err) {
    console.error("Location email failed:", err);
    return false;
  }
}
