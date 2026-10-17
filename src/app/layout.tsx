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
    "Shine Journal adalah buku catatan harian digital interaktif dengan tampilan buku fisik estetik, galeri memori foto & video, serta pelacak suasana hati (mood tracker).",
  keywords: [
    "buku harian online",
    "diary online",
    "diary online estetik",
    "buku diary digital",
    "jurnal harian online",
    "catatan pribadi digital",
    "personal diary app",
    "shine journal",
    "buku harian estetik",
    "mood tracker indonesia",
    "galeri memori foto video",
    "catatan harian rahasia",
    "aplikasi buku harian",
    "ruang cerita pribadi",
    "buku catatan harian digital",
    "aesthetic diary online",
    "online journal book",
    "diary book indonesia"
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
      "Ruang tenang untuk catatan harian, linimasa cerita estetik, galeri memori foto & video, dan pelacak mood harian interaktif.",
    url: appUrl,
    siteName: "Shine Journal",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shine Journal - Buku Catatan Harian Pribadi & Diary Online",
    description:
      "Buku catatan harian digital interaktif dengan desain buku estetik. Linimasa cerita, galeri foto & video, dan mood tracker.",
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
        "description": "Aplikasi buku harian digital interaktif dengan tampilan buku estetik, galeri foto & video, mood tracker, serta perlindungan privasi data.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "IDR",
        },
        "featureList": [
          "Desain Buku Harian Interaktif Realistis",
          "Pencatatan Cerita & Jurnal Pribadi",
          "Pelacak Mood Harian (Mood Tracker)",
          "Galeri Foto & Video Memori Berkapasitas 5GB",
          "Tema Klasik dan Tema Kuromi-Miku Estetik",
          "Sistem Keamanan Siber Terenkripsi & Perlindungan OWASP"
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${appUrl}/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Apa itu Shine Journal?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Shine Journal adalah buku catatan harian digital (online personal diary book) interaktif dengan konsep desain buku fisik realistis, dilengkapi galeri foto & video serta pelacak suasana hati (mood tracker)."
            }
          },
          {
            "@type": "Question",
            "name": "Apakah pengunjung umum bisa membaca cerita di Shine Journal?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Ya, pengunjung dapat langsung membaca seluruh linimasa catatan publik dan menyaring cerita berdasarkan suasana hati tanpa perlu login atau mendaftar akun."
            }
          },
          {
            "@type": "Question",
            "name": "Apakah Shine Journal bisa diakses melalui HP Android dan iPhone?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Tentu, Shine Journal dirancang responsif dan kompatibel dengan browser seluler (Chrome, Safari, Firefox) serta mendukung Web App Manifest (PWA)."
            }
          },
          {
            "@type": "Question",
            "name": "Bagaimana cara menyaring cerita berdasarkan suasana hati (Mood)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Pada linimasa catatan di beranda, pengunjung dapat memilih filter suasana hati seperti Happy (😊 Senang), Peaceful (😌 Tenang), Excited (🤩 Bersemangat), Sad (😢 Sedih), atau Angry (😡 Kesal)."
            }
          },
          {
            "@type": "Question",
            "name": "Bagaimana sistem keamanan siber di Shine Journal?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Situs ini menerapkan proteksi siber standar OWASP, enkripsi kata sandi bcrypt, token JWT aman berbasis HTTP-only cookies, dan pencegahan serangan brute-force."
            }
          }
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
