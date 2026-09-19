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
  title: "Obras de Cali a la vista | Consulta ciudadana y reconocimiento",
  description:
    "Consulta contratos de obra de Cali desde SECOP II en un mapa. Revisa valor, contratista y avance, confirma en terreno y reconoce a las entidades que cumplen.",
  keywords: [
    "obras Cali",
    "SECOP II",
    "consulta ciudadana",
    "veeduría",
    "contratación pública",
    "Colombia",
  ],
  openGraph: {
    title: "Obras de Cali a la vista | Consulta ciudadana",
    description:
      "Revisa contratos de obra de Cali en un mapa. Compara el registro SECOP II con el avance en terreno y reconoce a quien cumple.",
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