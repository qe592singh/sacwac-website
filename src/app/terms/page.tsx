import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import YoutubeIcon from "@/components/YoutubeIcon";
import {
  ShieldAlert,
  AlertTriangle,
  Scale,
  ExternalLink,
  Mail,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | SacWac - Salesforce Learning Hub",
  description:
    "Review the Terms of Service for SacWac. Understand your rights, acceptable use, intellectual property regarding notes & guides, YouTube integration, and educational disclaimers.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" /> Legal &amp; User Agreement
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Welcome to <strong className="text-slate-900 dark:text-white">SacWac</strong>. By accessing or using our website, study notes, videos, or tools, you agree to comply with and be bound by the following terms.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Last Updated: November 2026</span>
            <span>•</span>
            <span>Effective Immediately</span>
          </div>
        </div>

        {/* Quick Highlights Box */}
        <div className="p-6 rounded-2xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5 shrink-0" />
            <span>Summary for Learners &amp; Visitors</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            SacWac is an independent, community-driven educational platform created by <strong>Sachin Singh</strong> to help aspiring and working professionals master Salesforce Development, Admin, LWC, Apex, and Integrations. All materials are provided for personal educational purposes. Please test all code in sandbox/developer environments before deploying to production.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10 text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* 1. Acceptance */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono">01</span>
              <h2>Acceptance of Terms</h2>
            </div>
            <p>
              By accessing, browsing, reading, downloading materials, or using any feature on <strong>SacWac</strong> (accessible at <code className="text-xs bg-slate-200/70 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono">sacwac.in</code> and its related subdomains), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service, along with our{" "}
              <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-500">
                Privacy Policy
              </Link>.
            </p>
            <p>
              If you do not agree with any part of these terms, you must discontinue using SacWac immediately.
            </p>
          </section>

          {/* 2. Educational Disclaimer & Salesforce Trademarks */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono">02</span>
              <h2>Salesforce Trademark &amp; Independent Disclaimer</h2>
            </div>
            <p>
              <strong>Salesforce, Trailhead, Lightning, AppExchange, Apex, Visualforce, and other Salesforce logos or product names</strong> are registered trademarks of <span className="font-semibold text-slate-900 dark:text-white">salesforce.com, inc.</span>, San Francisco, USA.
            </p>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-sm space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Non-Affiliation Notice</span>
              </div>
              <p>
                SacWac is an independent educational initiative founded by Sachin Singh. SacWac is <strong>not</strong> officially associated with, endorsed by, sponsored by, or affiliated with salesforce.com, inc. All references to Salesforce products, certifications, exam formats, and architectures are solely for descriptive and educational training purposes.
              </p>
            </div>
          </section>

          {/* 3. Intellectual Property & Study Notes Usage */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono">03</span>
              <h2>Intellectual Property &amp; Content Usage</h2>
            </div>
            <p>
              All original study notes, architectural diagrams, revision sheets, step-by-step guides, sample code snippets, articles, branding, and graphics created by Sachin Singh and published on SacWac are the intellectual property of Sachin Singh / SacWac and are protected by applicable copyright laws.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Allowed
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Reading, studying, and downloading notes for personal career preparation.</li>
                  <li>Practicing sample code inside your personal Trailhead Playground or Sandbox.</li>
                  <li>Sharing direct links to SacWac pages with peers and study groups.</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-rose-600 dark:text-rose-400 text-sm">
                  <ShieldAlert className="w-4 h-4" /> Strictly Prohibited
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Reselling, bundling, or commercializing SacWac notes, PDFs, or code.</li>
                  <li>Scraping, automated harvesting, or republishing content on competing websites without express written permission.</li>
                  <li>Claiming ownership or authorship of Sachin Singh&apos;s educational materials.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. YouTube Integration & Video Terms */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono">04</span>
              <h2>YouTube Video Player &amp; Third-Party Streaming</h2>
            </div>
            <p>
              Video lessons and tutorials presented on SacWac are hosted on YouTube and embedded via YouTube&apos;s standard player.
            </p>
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-sm">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <YoutubeIcon className="w-4 h-4 text-red-500" /> YouTube Terms Compliance
              </div>
              <p>
                By accessing or viewing embedded video content on SacWac, you acknowledge and agree that your playback is also governed by the{" "}
                <a
                  href="https://www.youtube.com/t/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 inline-flex items-center gap-1"
                >
                  YouTube Terms of Service <ExternalLink className="w-3 h-3" />
                </a>{" "}
                and the{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 inline-flex items-center gap-1"
                >
                  Google Privacy Policy <ExternalLink className="w-3 h-3" />
                </a>.
              </p>
            </div>
          </section>

          {/* 5. Voluntary Contributions & Donations */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono">05</span>
              <h2>Voluntary Contributions, Coffee Donations &amp; Mentorship</h2>
            </div>
            <p>
              SacWac is primarily a free, open educational resource. Any financial contributions (such as &ldquo;Buy Me a Coffee&rdquo;, direct UPI transfers, or Razorpay tips) made by users are purely <strong>voluntary gratuities</strong> provided to support website hosting, domain renewals, and ongoing free content creation.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm pl-2">
              <li>
                <strong>Non-Refundable:</strong> Voluntary donations and coffee tips represent goodwill gifts and are non-refundable once processed.
              </li>
              <li>
                <strong>Third-Party 1:1 Mentorship:</strong> If you book a 1-on-1 career consultation, mock interview, or resume review through external platforms like Topmate, that service is governed by the pricing, cancellation, and refund policies posted on that third-party platform.
              </li>
            </ul>
          </section>

          {/* 6. User Conduct */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono">06</span>
              <h2>User Conduct &amp; Acceptable Use</h2>
            </div>
            <p>
              You agree to use SacWac in a responsible, lawful, and ethical manner. Specifically, you agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm pl-2">
              <li>Deploy automated bots, spiders, or scrapers to extract bulk notes, database contents, or video metadata without authorization.</li>
              <li>Attempt to circumvent security measures, probe vulnerabilities, or launch Denial-of-Service (DoS/DDoS) attacks against the platform.</li>
              <li>Transmit any virus, malicious payload, malware, or spam through contact forms or interactive areas.</li>
              <li>Misrepresent your identity or impersonate Sachin Singh, SacWac administrators, or other community members.</li>
            </ul>
          </section>

          {/* 7. Disclaimer of Warranties & Limitation of Liability */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono">07</span>
              <h2>Disclaimer of Warranties &amp; Limitation of Liability</h2>
            </div>
            <p className="text-sm">
              All tutorials, code patterns, tips, and study resources on SacWac are provided on an <strong>&ldquo;as is&rdquo;</strong> and <strong>&ldquo;as available&rdquo;</strong> basis without warranty of any kind, whether express, implied, or statutory.
            </p>
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-slate-900 dark:text-white">Important Sandbox &amp; Testing Warning:</div>
              <p>
                Salesforce metadata, custom Apex triggers, batch classes, flows, and LWC components shared on this platform are for demonstration and educational purposes. You are solely responsible for thoroughly testing, security-scanning, and validating any code or configuration within a sandbox or developer environment before deploying to any production or business-critical Salesforce instance.
              </p>
              <p>
                Under no circumstances shall Sachin Singh or SacWac be liable for any direct, indirect, incidental, consequential, special, or punitive damages (including loss of data, business disruption, or deployment failure) resulting from your use of the website or educational code examples.
              </p>
            </div>
          </section>

          {/* 8. External Links */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono">08</span>
              <h2>Third-Party Links &amp; Services</h2>
            </div>
            <p>
              SacWac includes hyperlinks to external third-party sites including Salesforce Official Documentation, Trailhead, GitHub, LinkedIn, YouTube, Topmate, and Cloudinary.
            </p>
            <p className="text-sm">
              We do not control and are not responsible for the availability, content, privacy practices, or terms of third-party websites. Accessing external links is strictly at your own discretion.
            </p>
          </section>

          {/* 9. Modifications */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono">09</span>
              <h2>Modifications to Terms &amp; Platform</h2>
            </div>
            <p>
              We reserve the right to revise or update these Terms of Service at any time without prior notice. Any modifications become effective immediately upon posting to this page. Your continued use of the website following the posting of revised terms indicates your acceptance of those changes.
            </p>
          </section>

          {/* 10. Governing Law */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono">10</span>
              <h2>Governing Law &amp; Jurisdiction</h2>
            </div>
            <p>
              These Terms shall be governed by and interpreted in accordance with the laws of <strong>India</strong>, without regard to its conflict of law principles. Any legal suit, action, or proceeding arising out of or related to these Terms or the website shall be instituted exclusively in the competent courts located in India.
            </p>
          </section>

          {/* 11. Contact */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono">11</span>
              <h2>Contact &amp; Inquiries</h2>
            </div>
            <p>
              If you have any questions, feedback, or legal inquiries regarding these Terms of Service, please reach out directly:
            </p>
            <div className="p-5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 space-y-3 text-sm">
              <div className="font-semibold text-slate-900 dark:text-white">
                SacWac Learning Platform
              </div>
              <div className="text-slate-600 dark:text-slate-300 space-y-1">
                <p>Founder &amp; Creator: <strong>Sachin Singh</strong></p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>sacwacsalesforce@gmail.com</span>
                  <span className="text-slate-400">•</span>
                  <span>sacwac.work@gmail.com</span>
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 underline underline-offset-4"
                >
                  Visit Contact Page <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Navigation CTA */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <Link
            href="/privacy"
            className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" /> View Privacy Policy
          </Link>
          <Link
            href="/contact"
            className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
          >
            Have questions? Contact Sachin Singh <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
