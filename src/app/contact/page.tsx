"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import YoutubeIcon from "@/components/YoutubeIcon";
import LinkedinIcon from "@/components/LinkedinIcon";
import {
  Mail,
  User,
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Clock,
  ExternalLink,
  Award,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSuccessMsg(data.message || "Your message has been sent successfully!");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to send your message. Please reach out to sacwac.work@gmail.com directly.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Get In Touch
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Let&apos;s Connect &amp; Collaborate
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Have a question about a Salesforce concept, want to suggest a tutorial topic, inquire about 1:1 mentorship, or discuss business collaborations? Send a message directly to Sachin.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Contact Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-sky-500" />
                Direct Channels
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <a
                  href="mailto:sacwac.work@gmail.com"
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-sky-500 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Work &amp; Business Email
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors truncate">
                      sacwac.work@gmail.com
                    </div>
                  </div>
                </a>

                <a
                  href="mailto:sacwacsalesforce@gmail.com"
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-sky-500 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Community &amp; Student Inquiries
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors truncate">
                      sacwacsalesforce@gmail.com
                    </div>
                  </div>
                </a>

                <a
                  href="https://topmate.io/sacwac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 hover:border-amber-500 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0 shadow-sm">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                        1:1 Mentorship &amp; Mock Interview
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-amber-500 opacity-80" />
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Book a Session on Topmate
                    </div>
                  </div>
                </a>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4 text-sky-500 shrink-0" />
                <span>Typical response time: within 24 to 48 hours</span>
              </div>
            </div>

            {/* Social & Community Links */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Connect Across Platforms
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://www.youtube.com/@SachinSingh-n2g7t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-2.5 transition-all text-xs font-semibold"
                >
                  <YoutubeIcon className="w-4 h-4 shrink-0" />
                  <span>YouTube</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                </a>

                <a
                  href="https://www.linkedin.com/in/sachin-singh-040290218/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-2.5 transition-all text-xs font-semibold"
                >
                  <LinkedinIcon className="w-4 h-4 shrink-0" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Send a Direct Message
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Fill in your details and Sachin will receive your message straight in his inbox.
                </p>
              </div>

              {/* Status Alerts */}
              {successMsg && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
                  <div>
                    <div className="font-bold">Message Delivered!</div>
                    <div className="mt-0.5">{successMsg}</div>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                  <div>
                    <div className="font-bold">Unable to Send</div>
                    <div className="mt-0.5">{errorMsg}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-500" />
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:opacity-60"
                  />
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-sky-500" />
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:opacity-60"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-sky-500" />
                        Phone Number
                      </label>
                      <span className="text-[11px] text-slate-400 font-normal">Optional</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                    Message You Want to Send <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your questions, feedback, scenario doubts, or partnership proposal..."
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:opacity-60 resize-y"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-60 transition-all shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 text-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Message via Nodemailer...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message Now
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
