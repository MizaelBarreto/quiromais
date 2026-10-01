import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CONTACT_INFO, SITE_NAME, SITE_URL, SOCIAL_LINKS } from "@/lib/constants";
import CookieConsent from "@/components/CookieConsent";
import { GA_ID } from "@/lib/analytics";
import { cookieChoiceScript } from "@/lib/consent";

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

const DESCRIPTION =
  "Quiropraxia e fisioterapia em Bauru-SP com a Dra. Priscila Santos. Tratamento para dores na coluna, cervical, ciática e enxaqueca. Agende sua avaliação.";
const SHARE_DESCRIPTION =
  "Movimento, saúde e menos dor: quiropraxia e fisioterapia em Bauru-SP com a Dra. Priscila Santos. Agende sua avaliação.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Quiro+ | Quiropraxia e Fisioterapia em Bauru — Priscila Santos",
    template: "%s | Quiro+",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
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
  category: "health",
  openGraph: {
    title: "Quiro+ | Quiropraxia e Fisioterapia em Bauru-SP",
    description: SHARE_DESCRIPTION,
    url: "/",
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiro+ | Quiropraxia e Fisioterapia em Bauru-SP",
    description: SHARE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      // o script de cookies abaixo pode marcar o <html> antes da hidratação
      suppressHydrationWarning
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        {GA_ID && <script dangerouslySetInnerHTML={{ __html: cookieChoiceScript }} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Quiro+ — Priscila Santos",
              description:
                "Clínica de quiropraxia e fisioterapia especializada com Priscila Santos.",
              "@id": `${SITE_URL}/#quiro-plus`,
              url: SITE_URL,
              image: `${SITE_URL}/images/fotoPriscila.png`,
              logo: `${SITE_URL}/icon.png`,
              email: CONTACT_INFO.email,
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
        <CookieConsent />
      </body>
    </html>
  );
}
