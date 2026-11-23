import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  Mail,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Server,
  Cookie,
  UserCheck,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | SacWac - Salesforce Learning Hub",
  description:
    "Learn how SacWac collects, protects, and manages your data. Comprehensive privacy policy covering YouTube API integration, analytics, cookies, and contact information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" /> Legal &amp; Transparency
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Transparent, secure, and respectful of your digital privacy. Here is how{" "}
            <strong className="text-slate-900 dark:text-white">SacWac</strong> collects, protects, and handles your information.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Last Updated: November 2026</span>
            <span>•</span>
            <span>Effective Immediately</span>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Zero Data Selling</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We never sell, rent, or trade your personal information to third-party advertisers or brokers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Secure Encrypted Transit</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All website interactions occur over modern SSL/TLS HTTPS encryption to safeguard your data.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">YouTube Compliant</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Full adherence to Google Privacy Policy and YouTube API Terms of Service for video streaming.
            </p>
          </div>
        </div>

        {/* Detailed Policy Sections */}
        <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Section 1: Introduction */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-sky-600 dark:text-sky-400 font-bold text-lg">
              <Sparkles className="w-5 h-5 shrink-0" />
              <h2>1. Introduction &amp; Platform Ownership</h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed">
              Welcome to <strong>SacWac</strong> (accessible at{" "}
              <a href="https://www.sacwac.in" className="text-sky-500 hover:underline font-medium">
                https://www.sacwac.in
              </a>
              ), an independent educational platform founded and operated by <strong>Sachin Singh</strong>. SacWac is dedicated to providing high-quality Salesforce video tutorials, architecture masterclasses, study notes, and scenario-based interview preparation for professionals and learners worldwide.
            </p>
            <p className="text-sm sm:text-base leading-relaxed">
              This Privacy Policy explains what information we collect, why we collect it, how it is protected, and your rights regarding your personal information when using our website and services.
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-sky-600 dark:text-sky-400 font-bold text-lg">
              <FileText className="w-5 h-5 shrink-0" />
              <h2>2. Information We Collect</h2>
            </div>
            <div className="space-y-3 text-sm sm:text-base">
              <h3 className="font-semibold text-slate-900 dark:text-white">A. Information You Provide Directly:</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Contact Form Inquiries:</strong> When you submit a message through our Contact Us page, we collect your name, email address, optional phone number, and the message content to respond to your technical questions or collaboration requests.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Voluntary Donations / Support Messages:</strong> If you choose to support SacWac via our &quot;Buy Me a Coffee&quot; or donation features, you may voluntarily provide your name, message, and transaction reference. Payment credentials (card numbers, UPI PINs) are processed directly by certified payment gateways and are never stored on our servers.
                </li>
              </ul>

              <h3 className="font-semibold text-slate-900 dark:text-white pt-2">B. Information Collected Automatically:</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Analytics &amp; Visitor Logs:</strong> To monitor website health, optimize page speed, and detect cyber threats, our server logs collect basic non-personally identifiable diagnostic information such as IP address (anonymized), browser user-agent, operating system, pages visited, and timestamp of access.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3: YouTube API Services & Embedded Video Content */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400 font-bold text-lg">
              <ExternalLink className="w-5 h-5 shrink-0" />
              <h2>3. YouTube API Services &amp; Embedded Players</h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed">
              SacWac utilizes YouTube API Services and embedded YouTube iframe video players to deliver Salesforce video tutorials directly on our website.
            </p>
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs sm:text-sm space-y-2 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Notice Regarding Google &amp; YouTube Policies:</span>
              </div>
              <p>
                By accessing, watching, or interacting with YouTube video content on SacWac, you acknowledge and agree that your interaction is also governed by:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  The{" "}
                  <a
                    href="https://www.youtube.com/t/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 dark:text-red-400 underline font-semibold"
                  >
                    YouTube Terms of Service
                  </a>
                </li>
                <li>
                  The{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 dark:text-red-400 underline font-semibold"
                  >
                    Google Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <p className="text-sm sm:text-base leading-relaxed">
              SacWac does not access, store, or collect your personal Google account credentials or private YouTube profile information. YouTube video statistics (such as public view counts and titles) are fetched via official, authorized read-only API requests.
            </p>
          </section>

          {/* Section 4: How We Use Your Information */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-sky-600 dark:text-sky-400 font-bold text-lg">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <h2>4. How We Use Collected Information</h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed">
              We use collected information solely for legitimate educational and technical purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              <li>To answer questions, requests, and mentorship inquiries submitted through our contact form.</li>
              <li>To acknowledge community members on our Community Supporters page when requested.</li>
              <li>To maintain website reliability, monitor load latency, and protect against security vulnerabilities or automated scraping.</li>
              <li>To synchronize course playlists so you always have access to the latest Salesforce lessons.</li>
            </ul>
          </section>

          {/* Section 5: Cookies and Local Storage */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-sky-600 dark:text-sky-400 font-bold text-lg">
              <Cookie className="w-5 h-5 shrink-0" />
              <h2>5. Cookies &amp; Browser Storage</h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed">
              SacWac uses minimal, essential browser cookies and local storage items:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Theme Preference:</strong> Storing whether you prefer dark mode or light mode.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Session Verification:</strong> Anonymous token verification to prevent duplicate contact form submissions or spam.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Embedded Players:</strong> YouTube iframe embeds may place standard Google tracking cookies in accordance with Google&apos;s privacy policies when you play a video.
              </li>
            </ul>
            <p className="text-xs sm:text-sm text-slate-500">
              You can configure your browser to reject cookies or notify you when cookies are being set. Disabling cookies will not affect your ability to browse our tutorials.
            </p>
          </section>

          {/* Section 6: Third-Party Services & Links */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-sky-600 dark:text-sky-400 font-bold text-lg">
              <Server className="w-5 h-5 shrink-0" />
              <h2>6. Third-Party Services &amp; External Links</h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed">
              We collaborate with trusted cloud providers and third-party tools to deliver our learning content:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-semibold text-slate-900 dark:text-white">Hosting &amp; Compute</span>
                <p className="text-slate-500">Vercel Serverless Platform (Global Edge Network with Indian CDN points)</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-semibold text-slate-900 dark:text-white">Database &amp; Documents</span>
                <p className="text-slate-500">MongoDB Atlas (Encrypted storage) &amp; Cloudinary (PDF study guides)</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-semibold text-slate-900 dark:text-white">Community Mentorship</span>
                <p className="text-slate-500">Topmate (External bookings for 1:1 resume &amp; technical coaching)</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-semibold text-slate-900 dark:text-white">Support &amp; Donations</span>
                <p className="text-slate-500">BuyMeACoffee, Razorpay &amp; UPI (Certified PCI-DSS compliant)</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 pt-1">
              Our website may contain links to external sites (such as Salesforce, LinkedIn, or GitHub). We do not control and are not responsible for the privacy practices of external third-party websites.
            </p>
          </section>

          {/* Section 7: Data Security and Retention */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-sky-600 dark:text-sky-400 font-bold text-lg">
              <Lock className="w-5 h-5 shrink-0" />
              <h2>7. Data Security &amp; Retention</h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed">
              We implement industry-standard technical measures including HTTPS encryption, environment variable secret isolation, and database connection authentication to guard against unauthorized access.
            </p>
            <p className="text-sm sm:text-base leading-relaxed">
              Contact messages are retained only as long as necessary to answer your inquiry and provide helpful follow-up assistance. You may request data deletion at any time.
            </p>
          </section>

          {/* Section 8: Your Rights */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-sky-600 dark:text-sky-400 font-bold text-lg">
              <UserCheck className="w-5 h-5 shrink-0" />
              <h2>8. Your Rights &amp; Choices</h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed">
              Under applicable digital privacy laws, you possess the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              <li>Request a copy of any personal details you have submitted via contact forms.</li>
              <li>Request correction or updates to your contact information or supporter recognition.</li>
              <li>Request permanent deletion of your inquiry data from our communication records.</li>
            </ul>
            <p className="text-sm sm:text-base leading-relaxed">
              To exercise any of these rights, email us directly at{" "}
              <a href="mailto:sacwacsalesforce@gmail.com" className="text-sky-500 font-semibold hover:underline">
                sacwacsalesforce@gmail.com
              </a>
              . We respond to all verified requests promptly.
            </p>
          </section>

          {/* Section 9: Children's Privacy */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-sky-600 dark:text-sky-400 font-bold text-lg">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h2>9. Children&apos;s Privacy</h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed">
              SacWac is an enterprise IT and software engineering educational platform intended for students, working professionals, and career transitioners. We do not knowingly collect personal information from children under 13 years of age.
            </p>
          </section>

          {/* Section 10: Contact Us */}
          <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-transparent border border-sky-500/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-sky-600 dark:text-sky-400 font-bold text-lg">
              <Mail className="w-5 h-5 shrink-0" />
              <h2>10. Contact Us Regarding Privacy</h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed">
              If you have any questions, suggestions, or concerns regarding this Privacy Policy, our data handling, or our YouTube integrations, please contact us:
            </p>
            <div className="space-y-2 text-sm sm:text-base font-mono bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-500">Founder &amp; Educator:</span>{" "}
                <span className="font-semibold text-slate-900 dark:text-white">Sachin Singh</span>
              </div>
              <div>
                <span className="text-slate-500">Platform:</span>{" "}
                <span className="font-semibold text-slate-900 dark:text-white">SacWac (https://www.sacwac.in)</span>
              </div>
              <div>
                <span className="text-slate-500">General Support:</span>{" "}
                <a href="mailto:sacwacsalesforce@gmail.com" className="text-sky-500 hover:underline">
                  sacwacsalesforce@gmail.com
                </a>
              </div>
              <div>
                <span className="text-slate-500">Work &amp; Business:</span>{" "}
                <a href="mailto:sacwac.work@gmail.com" className="text-sky-500 hover:underline">
                  sacwac.work@gmail.com
                </a>
              </div>
            </div>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl transition-all shadow-md shadow-sky-500/20"
              >
                Send Us a Message <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/terms"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
              >
                View Terms of Service
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
