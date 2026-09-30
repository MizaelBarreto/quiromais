import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CONTACT_INFO, SOCIAL_LINKS } from "@/lib/constants";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#F4EBDD",
};

export const metadata: Metadata = {
  title: "Quiro+ | Priscila Santos — Quiropraxia e Fisioterapia Especializada",
  description:
    "Quiropraxia e fisioterapia com Priscila Santos em Bauru-SP. Tratamento especializado em coluna, dores cervicais, ciáticas, enxaquecas e terapias complementares. Agende sua avaliação.",
  keywords: [
    "quiropraxia",
    "fisioterapia",
    "quiropraxista",
    "dor na coluna",
    "dor cervical",
    "dor ciática",
    "Priscila Santos",
    "Quiro+",
    "quiropraxia Bauru",
    "fisioterapia Bauru",
    "tratamento de coluna",
    "dry needling",
    "auriculoterapia",
  ],
  authors: [{ name: "Priscila Santos" }],
  openGraph: {
    title: "Quiro+ | Priscila Santos — Quiropraxia e Fisioterapia",
    description:
      "Movimento, saúde e menos dor — o cuidado que sua coluna merece. Agende sua avaliação com a Dra. Priscila Santos.",
    type: "website",
    locale: "pt_BR",
    siteName: "Quiro+",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiro+ | Priscila Santos",
    description:
      "Quiropraxia e fisioterapia especializada. Agende sua avaliação.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Quiro+ — Priscila Santos",
              description:
                "Clínica de quiropraxia e fisioterapia especializada com Priscila Santos.",
              "@id": "#quiro-plus",
              url: "https://quiromais.com.br",
              image: "/images/fotoPriscila.png",
              telephone: "+55-14-99640-6556",
              address: {
                "@type": "PostalAddress",
                streetAddress: `Pluri Working - ${CONTACT_INFO.street}`,
                addressLocality: CONTACT_INFO.city,
                addressRegion: CONTACT_INFO.state,
                postalCode: CONTACT_INFO.postalCode,
                addressCountry: "BR",
              },
              sameAs: [SOCIAL_LINKS.instagram],
              priceRange: "$$",
              medicalSpecialty: "Chiropractic",
              availableService: [
                { "@type": "MedicalTherapy", name: "Quiropraxia" },
                { "@type": "MedicalTherapy", name: "Fisioterapia" },
                { "@type": "MedicalTherapy", name: "Dry Needling" },
                { "@type": "MedicalTherapy", name: "Auriculoterapia" },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-dark font-sans">
        {children}
      </body>
    </html>
  );
}
