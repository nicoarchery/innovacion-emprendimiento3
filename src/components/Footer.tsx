import { MessageCircle } from "lucide-react";

import { buildWhatsAppLink } from "@/lib/whatsapp";

export function Footer() {
  const whatsappLink = buildWhatsAppLink(
    "Hola 👋 Quiero conocer más sobre la plataforma de trazabilidad de impacto territorial."
  );

  return (
    <footer className="border-t bg-slate-900 py-10 text-slate-300">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-white">
            Inteligencia Territorial
          </p>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            Plataforma de trazabilidad de impacto RSC/ESG. Datos y obras
            mostrados con fines de demostración.
          </p>
        </div>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1eb958]"
        >
          <MessageCircle className="h-4 w-4" />
          Escríbenos por WhatsApp
        </a>
      </div>
      <p className="mt-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} · Validación de mercado · Smoke Test
      </p>
    </footer>
  );
}