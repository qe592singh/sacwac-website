"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Coffee,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Users,
  Smartphone,
  ExternalLink,
  Globe,
} from "lucide-react";

interface DonationSettings {
  aboutTitle: string;
  aboutText: string;
  qrImage: string;
  quickAmounts: number[];
}

export default function SupportPage() {
  const [settings, setSettings] = useState<DonationSettings | null>(null);
  const [amount, setAmount] = useState<string>("1000");
  const [name, setName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [step, setStep] = useState<"form" | "payment" | "done">("form");
  const [donationId, setDonationId] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [confirming, setConfirming] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [supporterCount, setSupporterCount] = useState<number>(0);

  useEffect(() => {
    // Fetch settings and supporters count
    fetch("/api/donations/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error("Error loading donation settings:", err));

    fetch("/api/donations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.donations)) {
          setSupporterCount(data.donations.length);
        }
      })
      .catch((err) => console.error("Error loading supporters:", err));
  }, []);

  const handleContinueToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount < 1) {
      setError("Please choose or enter a valid donation amount (min ₹1).");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name or @social handle.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          amount: parsedAmount,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to start donation");
      }

      setDonationId(data.id);
      setStep("payment");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!donationId) return;
    setConfirming(true);
    setError("");

    try {
      const res = await fetch(`/api/donations/${donationId}/confirm`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to confirm payment");
      }

      setStep("done");
      setSupporterCount((prev) => prev + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not confirm entry";
      setError(msg);
    } finally {
      setConfirming(false);
    }
  };

  const quickAmounts = settings?.quickAmounts || [500, 1000, 2500, 5000];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-6 sm:space-y-8">
        {/* ================= HERO HEADER ================= */}
        <section className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold shadow-sm animate-pulse">
            <Coffee className="w-4 h-4" />
            Support Creator & Free Community Education
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Support the Work You <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">Enjoy</span> ☕
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Every YouTube tutorial, Salesforce architecture diagram, and lesson guide is 100% free. If my content has helped you upskill or land a Salesforce job, buying me a coffee fuels the next tutorial!
          </p>

          <div className="pt-1 flex items-center justify-center gap-3">
            <Link
              href="/supporters"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-xl hover:bg-sky-500/20 transition-all shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              View {supporterCount > 0 ? `${supporterCount} Supporters` : "Supporter Community"} →
            </Link>
          </div>
        </section>

        {/* ================= INTERNATIONAL / NON-INDIAN USER BANNER ================= */}
        <div className="max-w-xl mx-auto bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-sky-500/10 border border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Not an Indian user?
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  Global
                </span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                UPI only works in India. If you are an international supporter, you can donate easily via PayPal or credit card.
              </p>
            </div>
          </div>

          <a
            href="https://buymeacoffee.com/sacwac"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Coffee className="w-4 h-4 fill-slate-950" />
            <span>Donate via Buy Me a Coffee</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* ================= CENTERED INTERACTIVE DONATION CARD ================= */}
        <div className="max-w-xl mx-auto w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* STEP 1: FORM */}
          {step === "form" && (
            <form onSubmit={handleContinueToPayment} className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                    Make An Impact
                  </span>
                  <a
                    href="https://buymeacoffee.com/sacwac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Not in India? Use Buy Me a Coffee</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Buy Me a Coffee ☕
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Choose a contribution amount and leave your name or message.
                </p>
              </div>

              {/* Amount Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Choose Amount (₹ INR)
                </label>

                {/* Preset Quick Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {quickAmounts.map((q) => {
                    const isSelected = amount === String(q);
                    return (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setAmount(String(q))}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20 scale-[1.02]"
                            : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-500/50"
                        }`}
                      >
                        +₹{q.toLocaleString("en-IN")}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Field */}
                <div className="relative mt-2">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                    placeholder="Or enter custom amount"
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Supporter Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Your Name or @Social Handle
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma or @rahul_dev"
                  maxLength={80}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {/* Optional Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Message to Sachin (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {message.length}/300
                  </span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Say something nice or mention which tutorial helped you! 💬"
                  maxLength={300}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 text-sm font-bold text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-500 hover:from-sky-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? "Preparing Payment..." : `Continue to Payment (₹${Number(amount || 0).toLocaleString("en-IN")})`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: PAYMENT & QR SCAN */}
          {step === "payment" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-500 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change details / amount
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                  Almost There
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Scan UPI QR to Support 💜
                </h3>
                <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs text-sky-700 dark:text-sky-300 font-medium">
                  Paying <strong className="font-bold text-sky-600 dark:text-sky-400">₹{Number(amount).toLocaleString("en-IN")}</strong> as <strong className="font-bold">{name}</strong>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 max-w-[260px]">
                  <img
                    src={settings?.qrImage || "/images/payment-qr.png"}
                    alt="UPI Payment QR Code"
                    className="w-full h-auto object-contain rounded-xl"
                  />
                </div>

                <div className="text-center space-y-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-sky-500" />
                    Scan with Google Pay, PhonePe, Paytm, or BHIM
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Open any UPI scanner on your phone to complete payment.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 w-full text-center">
                  <a
                    href="https://buymeacoffee.com/sacwac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                  >
                    <span>Not an Indian user? Donate on Buy Me a Coffee instead</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={confirming}
                className="w-full py-3.5 px-6 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {confirming ? "Verifying..." : "I've Paid — Done ✓"}
              </button>

              <p className="text-[11px] text-center text-slate-400">
                After you scan & pay, click the button above so your name appears on the public supporters list!
              </p>
            </div>
          )}

          {/* STEP 3: SUCCESS / THANK YOU */}
          {step === "done" && (
            <div className="text-center space-y-6 py-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                  Contribution Received
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Thank You, {name}! 🎉
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Your contribution of <strong className="text-slate-900 dark:text-white">₹{Number(amount).toLocaleString("en-IN")}</strong> means a lot and directly supports creating more free Salesforce tutorials, scenario guides, and architectural notes.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/supporters"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  See Your Name in Supporters List →
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setAmount("1000");
                    setName("");
                    setMessage("");
                    setDonationId("");
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
                >
                  Send Another
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
