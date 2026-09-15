import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";

import "./globals.css";

import { PrototypeNotice } from "@/components/PrototypeNotice";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const gaId = process.env.NEXT_PUBLIC_GA4_ID;

export const metadata: Metadata = {
  title:
    "Inteligencia Territorial | Transparencia ESG y Obras Verificadas en Colombia",
  description:
    "La plataforma de inteligencia territorial que conecta la inversión corporativa con la realidad de las comunidades en Colombia. Transparencia verificada entre datos de SECOP II, reportes ESG y evidencias en campo.",
  keywords: [
    "ESG",
    "SECOP II",
    "transparencia",
    "obras por impuestos",
    "Colombia",
    "responsabilidad social",
    "geolocalización",
  ],
  openGraph: {
    title: "Inteligencia Territorial | Transparencia ESG Verificada",
    description:
      "Consulta el mapa abierto de proyectos de infraestructura verificados en tu municipio. Transparencia entre SECOP II, reportes ESG y evidencias en campo.",
    type: "website",
    locale: "es_CO",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#047857",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        {pixelId ? (
          <Script id="fb-pixel-init" strategy="beforeInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');fbq('track','PageView');`}
          </Script>
        ) : null}
        {gaId ? (
          <>
            <Script
              id="ga4-init"
              strategy="beforeInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script id="ga4-script" strategy="beforeInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        ) : null}
      </head>
      <body className="min-h-full flex flex-col">
        <PrototypeNotice />
        {children}
      </body>
    </html>
  );
}