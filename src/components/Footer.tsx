import { MessageCircle } from "lucide-react";

import { buildWhatsAppLink } from "@/lib/whatsapp";

export function Footer() {
  const whatsappLink = buildWhatsAppLink(
    "Quiero conocer la plataforma de consulta de obras de Cali."
  );

  return (
    <footer className="border-t bg-slate-900 py-10 text-slate-300">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-white">
            Obras a la Vista · Cali
          </p>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            Consulta contratos SECOP II y reconoce a las entidades que cumplen.
            Ubicaciones aproximadas.
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
        © {new Date().getFullYear()} · Prototipo en validación
      </p>
    </footer>
  );
}