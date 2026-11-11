import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { VisitorLogModel } from "@/models/VisitorLog";

function parseUserAgent(ua: string) {
  let device: "desktop" | "mobile" | "tablet" = "desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device = "tablet";
  } else if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(
      ua
    )
  ) {
    device = "mobile";
  }

  let browser = "Other";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  let os = "Other";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}

function parseReferrerDomain(ref: string): string {
  if (!ref || ref.trim() === "") return "Direct";
  try {
    const url = new URL(ref);
    const host = url.hostname.toLowerCase();
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "YouTube";
    if (host.includes("google.")) return "Google";
    if (host.includes("linkedin.com")) return "LinkedIn";
    if (host.includes("t.co") || host.includes("twitter.com") || host.includes("x.com")) return "X / Twitter";
    if (host.includes("github.com")) return "GitHub";
    if (host.includes("topmate.io")) return "Topmate";
    if (host.includes("buymeacoffee.com")) return "Buy Me a Coffee";
    return host.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawPath = String(body.path || "/").trim();

    // Ignore admin routes, static files, and internal API calls
    if (
      rawPath.startsWith("/admin") ||
      rawPath.startsWith("/api") ||
      rawPath.startsWith("/_next") ||
      rawPath.includes("favicon") ||
      rawPath.includes(".png") ||
      rawPath.includes(".jpg") ||
      rawPath.includes(".svg")
    ) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const headers = request.headers;
    const ua = headers.get("user-agent") || "";
    const { device, browser, os } = parseUserAgent(ua);

    // Extract IP (take first IP if comma separated)
    const forwardedFor = headers.get("x-forwarded-for") || "";
    const ip = (forwardedFor ? forwardedFor.split(",")[0].trim() : headers.get("x-real-ip")) || "anonymous";

    // Vercel Geo headers
    const country = headers.get("x-vercel-ip-country") || "Unknown";
    const city = headers.get("x-vercel-ip-city") || "Unknown";

    const referrer = String(body.referrer || headers.get("referer") || "").trim();
    const referrerDomain = parseReferrerDomain(referrer);

    await connectToDatabase();
    await VisitorLogModel.create({
      path: rawPath.slice(0, 150),
      ip: ip.slice(0, 45),
      country: country.slice(0, 60),
      city: city.slice(0, 60),
      device,
      browser,
      os,
      referrer: referrer.slice(0, 300),
      referrerDomain: referrerDomain.slice(0, 100),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/analytics/track error:", error);
    return NextResponse.json({ success: false, error: "Failed to record log" }, { status: 500 });
  }
}
