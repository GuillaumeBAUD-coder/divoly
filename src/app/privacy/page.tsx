import type { Metadata } from "next";
import Link from "next/link";
import { DivolyWordmark } from "@/components/DivolyLogo";

export const metadata: Metadata = {
  title: "Privacy Policy — Divoly",
  description: "Privacy policy for Divoly — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-16">Last updated: May 25, 2026</p>

        <div className="space-y-10 text-white/60 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Who we are</h2>
            <p>
              Divoly (<strong className="text-white/80">divoly.com</strong>) is a crowdsourced library of AI-generated answers.
              For any privacy-related inquiry, contact us at{" "}
              <a href="mailto:hello@divoly.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                hello@divoly.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Data we collect</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-white/80">Account data:</strong> email address, display name, and profile information when you create an account.</li>
              <li><strong className="text-white/80">OAuth data:</strong> if you sign in with Google, we receive your name, email, and profile picture from Google.</li>
              <li><strong className="text-white/80">Contributed content:</strong> prompts and AI-generated answers you voluntarily submit.</li>
              <li><strong className="text-white/80">Usage data:</strong> pages visited, search queries, and interactions, collected via analytics (PostHog) to improve the service.</li>
              <li><strong className="text-white/80">Technical data:</strong> IP address, browser type, and device type, collected automatically by our servers and CDN.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. How we use your data</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>To provide and maintain the Divoly service.</li>
              <li>To display your contributed answers and associate them with your profile.</li>
              <li>To send transactional emails (account confirmation, password reset).</li>
              <li>To analyze usage patterns and improve user experience.</li>
              <li>We never sell your personal data to third parties.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Data storage</h2>
            <p>
              Your data is stored in a PostgreSQL database hosted on Neon (cloud infrastructure located in the United States).
              Files and assets may be stored on Vercel CDN infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Cookies</h2>
            <p>
              Divoly uses a session cookie to keep you logged in. We also use analytics cookies (PostHog) to understand how visitors use the site.
              No advertising cookies or third-party tracking pixels are used.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Your rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data at any time by emailing{" "}
              <a href="mailto:hello@divoly.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                hello@divoly.com
              </a>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. Children</h2>
            <p>
              Divoly is not directed at children under 13. We do not knowingly collect personal data from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">8. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. The "Last updated" date at the top will reflect any changes.
              Continued use of Divoly after updates constitutes acceptance of the new policy.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-white/5 px-6 py-8 mt-20">
        <div className="mx-auto flex max-w-4xl items-center justify-between text-xs text-white/20">
          <span>© 2026 divoly.com</span>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-white/40 transition-colors">About</Link>
            <Link href="/legal" className="hover:text-white/40 transition-colors">Legal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
