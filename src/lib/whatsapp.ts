const PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "573000000000";

export function buildWhatsAppLink(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${PHONE}?text=${encoded}`;
}

export function openWhatsApp(message: string) {
  window.open(buildWhatsAppLink(message), "_blank");
}
