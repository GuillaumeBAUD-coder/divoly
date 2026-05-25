import type { Metadata } from "next";
import Link from "next/link";
import { DivolyWordmark } from "@/components/DivolyLogo";

export const metadata: Metadata = {
  title: "About — Divoly",
  description: "Divoly is a crowdsourced library of real AI responses. Search once, find reusable answers instantly.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#07070f] text-white">
      {/* Nav */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/">
            <DivolyWordmark height={24} />
          </Link>
          <Link href="/explore" className="text-sm text-white/40 hover:text-white transition-colors">
            Explore
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">About Divoly</h1>
        <p className="text-white/50 text-lg mb-16">The crowdsourced AI answer library.</p>

        <section className="space-y-12">
          <div>
            <h2 className="text-xl font-semibold mb-3 text-white">What is Divoly?</h2>
            <p className="text-white/60 leading-relaxed">
              Divoly is a public library of real AI-generated answers, contributed and curated by its community.
              Instead of asking the same question to an AI over and over, Divoly lets you search answers that already
              exist — indexed, categorized, and reusable.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-white">Why does it exist?</h2>
            <p className="text-white/60 leading-relaxed">
              Every day, millions of people ask the same questions to AI models. Those answers get generated, consumed,
              and discarded inside private chat threads. Divoly turns that ephemeral knowledge into a persistent,
              searchable, shared resource — so the best answers don't disappear.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-white">How does it work?</h2>
            <ol className="space-y-3 text-white/60 leading-relaxed list-decimal list-inside">
              <li>Someone asks an AI and gets a great answer.</li>
              <li>They contribute the prompt + response to Divoly.</li>
              <li>The answer becomes a public, searchable page.</li>
              <li>The next person finds it instantly — no new generation needed.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-white">Who runs Divoly?</h2>
            <p className="text-white/60 leading-relaxed">
              Divoly is an independent project. It is not affiliated with any AI company.
              The site is maintained by its founder and the community of contributors.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-white">Contact</h2>
            <p className="text-white/60 leading-relaxed">
              For any question, partnership request, or content removal inquiry:{" "}
              <a href="mailto:hello@divoly.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                hello@divoly.com
              </a>
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-6 py-8 mt-20">
        <div className="mx-auto flex max-w-4xl items-center justify-between text-xs text-white/20">
          <span>© 2026 divoly.com</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white/40 transition-colors">Privacy</Link>
            <Link href="/legal" className="hover:text-white/40 transition-colors">Legal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
