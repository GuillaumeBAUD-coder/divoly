import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { PostHogProvider } from "@/components/PostHogProvider";
import { PageViewTracker } from "@/components/PageViewTracker";

export const metadata: Metadata = {
  title: "Divoly — Crowdsourced AI Answers",
  description: "Search millions of real AI answers without querying AI. Save energy, save water, share knowledge. divoly.com",
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
