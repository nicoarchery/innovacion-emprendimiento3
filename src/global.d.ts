declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: Record<string, unknown>) => void;
    gtag?: (
      command: string,
      ...args: Array<string | number | Record<string, unknown>>
    ) => void;
  }
}

export {};