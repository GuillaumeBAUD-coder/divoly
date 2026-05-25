import type { Metadata } from "next";
import Link from "next/link";
import { DivolyWordmark } from "@/components/DivolyLogo";

export const metadata: Metadata = {
  title: "Legal Notices — Divoly",
  description: "Legal notices and terms of use for Divoly.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#07070f] text-white">
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
        <h1 className="text-4xl font-bold mb-4">Legal Notices</h1>
        <p className="text-white/40 text-sm mb-16">Last updated: May 25, 2026</p>

        <div className="space-y-10 text-white/60 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Publisher</h2>
            <p>
              Divoly (<strong className="text-white/80">divoly.com</strong>) is an independent web service.
              For any legal inquiry, contact:{" "}
              <a href="mailto:hello@divoly.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                hello@divoly.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Hosting</h2>
            <p>
              Divoly is hosted on <strong className="text-white/80">Vercel Inc.</strong>, 340 Pine Street, Suite 701,
              San Francisco, CA 94104, USA — <a href="https://vercel.com" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">vercel.com</a>.
              Database infrastructure is provided by <strong className="text-white/80">Neon Inc.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Terms of use</h2>
            <p className="mb-3">
              By using Divoly, you agree to the following terms:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>You must not submit content that is illegal, harmful, deceptive, or infringes on third-party rights.</li>
              <li>You must not use automated tools to scrape, crawl, or abuse the service without prior written permission.</li>
              <li>Contributed content must be accurate to the best of your knowledge. Fabricated or misleading answers are prohibited.</li>
              <li>By contributing content, you grant Divoly a non-exclusive, royalty-free license to display and distribute it publicly.</li>
              <li>Divoly reserves the right to remove any content or suspend any account at its sole discretion.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Intellectual property</h2>
            <p>
              The Divoly name, logo, and interface design are proprietary. Contributed AI-generated content is shared
              publicly under the assumption that it was lawfully generated and that contributors have the right to share it.
              If you believe content infringes your rights, contact{" "}
              <a href="mailto:hello@divoly.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                hello@divoly.com
              </a>{" "}
              for a removal request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Limitation of liability</h2>
            <p>
              Divoly provides content "as is" without any warranty of accuracy, completeness, or fitness for a particular purpose.
              AI-generated answers are community contributions and do not constitute professional advice (legal, medical, financial, or otherwise).
              Divoly shall not be held liable for any direct or indirect damages resulting from the use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Applicable law</h2>
            <p>
              These terms are governed by applicable law. Any dispute shall be subject to the jurisdiction of the competent courts.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-white/5 px-6 py-8 mt-20">
        <div className="mx-auto flex max-w-4xl items-center justify-between text-xs text-white/20">
          <span>© 2026 divoly.com</span>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-white/40 transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-white/40 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
