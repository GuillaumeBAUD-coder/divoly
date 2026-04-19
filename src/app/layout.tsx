import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { PostHogProvider } from "@/components/PostHogProvider";
import { PageViewTracker } from "@/components/PageViewTracker";

export const metadata: Metadata = {
  title: "Divoly | Search AI Answers, Not AI",
  description: "Divoly is a crowdsourced library of real AI responses. Search once, find answers instantly, no inference, no energy waste. Contributed by the community.",
  metadataBase: new URL("https://divoly.com"),
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Divoly | Search AI Answers, Not AI",
    description: "Crowdsourced AI answers you can search instantly. No inference. No energy waste. Just knowledge shared by the community.",
    url: "https://divoly.com",
    siteName: "Divoly",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Divoly | Search AI Answers, Not AI",
    description: "Crowdsourced AI answers you can search instantly. No inference. No energy waste.",
  },
  keywords: ["AI answers", "crowdsourced AI", "search AI responses", "prompt library", "AI knowledge base", "eco AI", "zero inference"],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <SessionProvider>
          <PostHogProvider>
            <PageViewTracker />
            {children}
          </PostHogProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
