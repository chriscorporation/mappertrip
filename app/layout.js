import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Preloader from "./components/Preloader";
import ToastContainer from "./components/ToastContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mapper Trip - Viajes seguros para nómadas digitales en Latinoamérica",
  description: "Descubre zonas seguras, coworkings, cafés con wifi y Airbnbs económicos en Latinoamérica. Plataforma para nómadas digitales y viajeros internacionales con información de locales.",
  keywords: "nómadas digitales, viajes seguros, coworking latinoamérica, cafés wifi, airbnb económicos, zonas seguras, viajes latinoamérica, trabajo remoto, espacios coworking, lugares instagramables, viajeros internacionales, comunidad viajeros, ciudades seguras, hostels para nómadas, trips latinoamérica",
  authors: [{ name: "Mapper Trip" }],
  openGraph: {
    title: "Mapper Trip - Viajes seguros para nómadas digitales",
    description: "Descubre zonas seguras, coworkings y Airbnbs económicos en Latinoamérica",
    type: "website",
    locale: "es_LA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mapper Trip - Viajes seguros para nómadas digitales",
    description: "Descubre zonas seguras, coworkings y Airbnbs económicos en Latinoamérica",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Mapper Trip",
    "description": "Plataforma para nómadas digitales que buscan zonas seguras, coworkings y Airbnbs en Latinoamérica",
    "url": "https://mappertrip.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://mappertrip.com/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "es-LA",
    "publisher": {
      "@type": "Organization",
      "name": "Mapper Trip",
      "description": "Comunidad de viajeros y nómadas digitales"
    }
  };

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Preloader />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
