import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import KuromiMikuCompanion from "@/components/KuromiMikuCompanion";

export const metadata: Metadata = {
  title: "My Diary",
  description: "A personal diary book",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
