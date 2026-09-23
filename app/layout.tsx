import type { Metadata } from "next";
import { Anton, Archivo, JetBrains_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { introScript } from "@/lib/intro";
import { profile } from "@/lib/profile";
import {
  KEYWORDS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  personSchema,
} from "@/lib/site";
import CursorGlow from "@/components/CursorGlow";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} · Computing Science Student and Developer`,
    // every page appends the name, so a tab or a search result still says whose site it is
    template: `%s · ${profile.name}`,
  },
  description: SITE_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: profile.name, url: profile.linkedin }],
  creator: profile.name,
  publisher: profile.name,
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${profile.name} · Computing Science Student and Developer`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} · Computing Science Student and Developer`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { email: false, address: false, telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-intro="play"
      suppressHydrationWarning
      className={`${anton.variable} ${archivo.variable} ${jetbrains.variable} h-full`}
    >
      <head>
        {/* decides before first paint whether the hello intro plays, see lib/intro.ts */}
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        {/* who this is, in the form search engines and assistants parse */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema()) }}
        />
        <noscript>
          <style>{`.intro-overlay{display:none!important}html{overflow:auto!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <IntroHello />
        <div className="wallpaper" aria-hidden />
        <CursorGlow />
        <div className="top-scrim" aria-hidden />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
