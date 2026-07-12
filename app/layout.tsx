import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Interactions from "./interactions";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://elcstudio.net"),
  title: "elc.studio - Websites + Social Presence",
  description:
    "Premium websites, client spaces and consistent online presence for local businesses.",
  openGraph: {
    title: "elc.studio - Websites + Social Presence",
    description:
      "Premium websites, client spaces and consistent online presence for local businesses.",
    images: ["/images/open-graph.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "elc.studio - Websites + Social Presence",
    description:
      "Premium websites, client spaces and consistent online presence for local businesses.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/images/webclip.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <head>
        <noscript>
          <style>{`.elc-preloader,.elc-cursor{display:none}`}</style>
        </noscript>
      </head>
      <body className="elc-body">
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('elc-visited'))document.documentElement.classList.add('elc-returning')}catch(e){}` }} />
        <div className="elc-preloader" aria-hidden="true" data-preloader>
          <p className="elc-preloader-logo" data-preloader-logo>
            elc.studio<span>©</span>
          </p>
        </div>
        {children}
        <div className="elc-cursor" aria-hidden="true" data-cursor />
        <Interactions />
      </body>
    </html>
  );
}
