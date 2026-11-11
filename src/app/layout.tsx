import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import VisitorTracker from "@/components/VisitorTracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SacWac | Salesforce Learning Hub by Sachin Singh",
  description:
    "Official website for SacWac YouTube Channel. Practical Salesforce tutorials, architecture breakdowns, scenario-based learning, and protected online notes by Sachin Singh.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
  keywords: [
    "Salesforce",
    "SacWac",
    "Sachin Singh",
    "Salesforce Flows",
    "Apex",
    "Salesforce Admin",
    "Salesforce Developer",
    "Salesforce Tutorials",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200`}
      >
        <ThemeProvider>
          <VisitorTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
