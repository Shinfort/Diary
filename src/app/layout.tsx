import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import KuromiMikuCompanion from "@/components/KuromiMikuCompanion";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shinejournals.vercel.app";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1917" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Shine Journal - Buku Catatan Harian Pribadi & Diary Online Interaktif",
    template: "%s | Shine Journal",
  },
  description:
    "Shine Journal adalah buku catatan harian digital interaktif dengan tampilan buku estetik. Tulis kenangan, simpan galeri foto & video, pantau mood harian, serta catat keuangan dengan aman dan nyaman.",
  keywords: [
    "diary online",
    "buku harian online",
    "buku catatan harian",
    "jurnal harian online",
    "catatan pribadi digital",
    "personal diary app",
    "shine journal",
    "buku harian estetik",
    "mood tracker indonesia",
    "diary book online",
    "aplikasi buku harian",
    "catatan memori harian"
  ],
  authors: [{ name: "Shine Journal Team", url: appUrl }],
  creator: "Shine Journal",
  publisher: "Shine Journal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Shine Journal - Buku Catatan Harian Pribadi & Diary Online",
    description:
      "Aplikasi buku catatan harian pribadi interaktif. Simpan momen spesial, galeri memori, mood tracker, dan kelola jurnal hidup Anda dengan aman.",
    url: appUrl,
    siteName: "Shine Journal",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shine Journal - Buku Catatan Harian Pribadi & Diary Online",
    description:
      "Aplikasi buku catatan harian pribadi interaktif dengan desain buku estetik. Tulis cerita, unggah foto, dan lacak mood setiap hari.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "u7zPsJZz_B9xa88111H4eDmzYxl3_7SQacxySUErQIc",
  },
  category: "lifestyle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${appUrl}/#website`,
        "url": appUrl,
        "name": "Shine Journal",
        "description": "Buku catatan harian digital interaktif dan jurnal pribadi aman.",
        "inLanguage": "id-ID",
      },
      {
        "@type": "WebApplication",
        "@id": `${appUrl}/#webapp`,
        "name": "Shine Journal",
        "url": appUrl,
        "applicationCategory": "LifestyleApplication",
        "operatingSystem": "All modern browsers (Chrome, Safari, Firefox, Edge, Android, iOS)",
        "description": "Aplikasi buku harian digital interaktif dengan tampilan buku estetik, galeri foto & video, mood tracker, serta catatan keuangan pribadi.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "IDR",
        },
        "featureList": [
          "Desain Buku Harian Interaktif Realistis",
          "Pencatatan Cerita & Jurnal Pribadi",
          "Pelacak Mood Harian (Mood Tracker)",
          "Galeri Foto & Video Memori",
          "Pencatatan Finansial & Keuangan Pribadi",
          "Tema Klasik dan Tema Kuromi-Miku Estetik",
          "Sistem Autentikasi Aman & Kuota Penyimpanan Terenkripsi"
        ]
      }
    ]
  };

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="u7zPsJZz_B9xa88111H4eDmzYxl3_7SQacxySUErQIc" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var t = localStorage.getItem('diary_theme');
                if (t === 'kuromi-miku') {
                  document.documentElement.setAttribute('data-theme', 'kuromi-miku');
                } else {
                  document.documentElement.setAttribute('data-theme', 'classic');
                }
              } catch(e) {}
            })();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <KuromiMikuCompanion />
        </ThemeProvider>
      </body>
    </html>
  );
}
