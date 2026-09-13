export function trackPixel(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

export function trackGA4(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    if (params) {
      window.gtag("event", event, params);
    } else {
      window.gtag("event", event);
    }
  }
}

export function track(event: string, params?: Record<string, unknown>) {
  trackPixel(event, params);
  trackGA4(event, params);
}
