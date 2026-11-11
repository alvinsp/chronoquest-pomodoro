import QRCode from "qrcode";

export interface SyncPayload {
  version: number;
  appName: string;
  userEmail: string;
  timestamp: number;
  data: {
    hero: string | null;
    goals: string | null;
    stats: string | null;
    notes: string | null;
    timer: string | null;
    auth: string | null;
  };
}

// Convert ArrayBuffer to URL-safe base64
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Convert URL-safe base64 to Uint8Array
function base64UrlToBuffer(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Packs all local storage states and compresses them into a compact base64url string.
 */
export async function createSyncPayloadString(
  userEmail: string = "alvin1234putra@gmail.com",
): Promise<string> {
  const payload: SyncPayload = {
    version: 1,
    appName: "ChronoQuest",
    userEmail,
    timestamp: Date.now(),
    data: {
      hero:
        typeof localStorage !== "undefined"
          ? localStorage.getItem("pixel-pomodoro-gamify")
          : null,
      goals:
        typeof localStorage !== "undefined"
          ? localStorage.getItem("pixel-pomodoro-goals")
          : null,
      stats:
        typeof localStorage !== "undefined"
          ? localStorage.getItem("pixel-pomodoro-stats")
          : null,
      notes:
        typeof localStorage !== "undefined"
          ? localStorage.getItem("pixel-pomodoro-notes")
          : null,
      timer:
        typeof localStorage !== "undefined"
          ? localStorage.getItem("pixel-pomodoro-timer")
          : null,
      auth:
        typeof localStorage !== "undefined"
          ? localStorage.getItem("pixel-pomodoro-auth")
          : null,
    },
  };

  const jsonStr = JSON.stringify(payload);

  // If CompressionStream is available, gzip compress it
  if (typeof CompressionStream !== "undefined") {
    try {
      const stream = new Blob([jsonStr])
        .stream()
        .pipeThrough(new CompressionStream("gzip"));
      const buffer = await new Response(stream).arrayBuffer();
      return "gz:" + bufferToBase64Url(buffer);
    } catch {
      // fallback to plain base64url
    }
  }

  // Fallback
  return "raw:" + btoa(encodeURIComponent(jsonStr));
}

/**
 * Decompresses and extracts a sync payload string.
 */
export async function decodeSyncPayloadString(
  encoded: string,
): Promise<SyncPayload | null> {
  try {
    let jsonStr = "";

    if (encoded.startsWith("gz:")) {
      const cleanB64 = encoded.slice(3);
      const buffer = base64UrlToBuffer(cleanB64);
      if (typeof DecompressionStream !== "undefined") {
        const stream = new Blob([buffer.buffer as ArrayBuffer])
          .stream()
          .pipeThrough(new DecompressionStream("gzip"));
        jsonStr = await new Response(stream).text();
      } else {
        return null;
      }
    } else if (encoded.startsWith("raw:")) {
      jsonStr = decodeURIComponent(atob(encoded.slice(4)));
    } else {
      // Try parsing directly as JSON
      jsonStr = encoded;
    }

    const parsed: SyncPayload = JSON.parse(jsonStr);
    if (!parsed || parsed.appName !== "ChronoQuest") return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Restores a decoded sync payload into localStorage.
 */
export function applySyncPayloadToLocalStorage(payload: SyncPayload): boolean {
  try {
    const { data } = payload;
    if (data.hero) localStorage.setItem("pixel-pomodoro-gamify", data.hero);
    if (data.goals) localStorage.setItem("pixel-pomodoro-goals", data.goals);
    if (data.stats) localStorage.setItem("pixel-pomodoro-stats", data.stats);
    if (data.notes) localStorage.setItem("pixel-pomodoro-notes", data.notes);
    if (data.timer) localStorage.setItem("pixel-pomodoro-timer", data.timer);
    if (data.auth) localStorage.setItem("pixel-pomodoro-auth", data.auth);

    // Also update account backup key
    if (payload.userEmail) {
      const key = `chronoquest_account_${payload.userEmail.toLowerCase()}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          user: {
            id: "usr-" + Date.now(),
            email: payload.userEmail,
            name: payload.userEmail.split("@")[0],
            lastLoginAt: new Date().toISOString(),
          },
          savedAt: new Date().toISOString(),
          ...data,
        }),
      );
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Generates a full sync URL with hash fragment and corresponding QR code Data URL.
 */
export async function generateSyncUrlAndQr(
  userEmail: string,
): Promise<{
  syncUrl: string;
  qrDataUrl: string;
  payloadCode: string;
  isTooLargeForQr: boolean;
}> {
  const payloadCode = await createSyncPayloadString(userEmail);
  const baseUrl = window.location.origin + window.location.pathname;
  const syncUrl = `${baseUrl}#sync=${encodeURIComponent(payloadCode)}`;

  let qrDataUrl = "";
  let isTooLargeForQr = false;

  try {
    qrDataUrl = await QRCode.toDataURL(syncUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "L",
    });
  } catch (err) {
    console.warn("QR code generation error (payload too large):", err);
    isTooLargeForQr = true;
  }

  return { syncUrl, qrDataUrl, payloadCode, isTooLargeForQr };
}
