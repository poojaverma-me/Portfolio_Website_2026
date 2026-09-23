import type { Metadata } from "next";
import { Anton, Archivo, JetBrains_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { themeScript } from "@/lib/theme";
import { introScript } from "@/lib/intro";
import IntroHello from "@/components/IntroHello";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pooja Verma · CS Student & Builder",
  description:
    "Portfolio of Pooja Verma, computing science student at Thompson Rivers University. Full-stack projects, research, and shipped work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-intro="play"
      suppressHydrationWarning
      className={`${anton.variable} ${archivo.variable} ${jetbrains.variable} h-full`}
    >
      <head>
        {/* applies the saved theme before first paint, see lib/theme.ts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* decides before first paint whether the hello intro plays, see lib/intro.ts */}
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <noscript>
          <style>{`.intro-overlay{display:none!important}html{overflow:auto!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <IntroHello />
        <div className="wallpaper" aria-hidden />
        <div className="top-scrim" aria-hidden />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
