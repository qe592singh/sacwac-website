import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { VisitorLogModel } from "@/models/VisitorLog";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const daysParam = parseInt(searchParams.get("days") || "14", 10);
    const daysLimit = Math.min(Math.max(daysParam, 7), 60);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const startDate = new Date(startOfToday.getTime() - (daysLimit - 1) * 24 * 60 * 60 * 1000);

    // Parallel aggregations for performance
    const [
      totalViews,
      uniqueVisitorsArr,
      viewsToday,
      uniqueTodayArr,
      viewsYesterday,
      dailyTrendRaw,
      topPagesRaw,
      topReferrersRaw,
      devicesRaw,
      browsersRaw,
      topCountriesRaw,
      recentLogs,
    ] = await Promise.all([
      // Total all-time pageviews
      VisitorLogModel.countDocuments(),

      // Total all-time unique IPs
      VisitorLogModel.distinct("ip"),

      // Today's total views
      VisitorLogModel.countDocuments({ createdAt: { $gte: startOfToday } }),

      // Today's unique visitors
      VisitorLogModel.distinct("ip", { createdAt: { $gte: startOfToday } }),

      // Yesterday's total views
      VisitorLogModel.countDocuments({
        createdAt: { $gte: startOfYesterday, $lt: startOfToday },
      }),

      // Daily trend over requested daysLimit
      VisitorLogModel.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            views: { $sum: 1 },
            uniqueIps: { $addToSet: "$ip" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top Visited Pages
      VisitorLogModel.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$path", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Top Referrers
      VisitorLogModel.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$referrerDomain", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // Device Breakdown
      VisitorLogModel.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$device", count: { $sum: 1 } } },
      ]),

      // Browser Breakdown
      VisitorLogModel.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),

      // Top Countries
      VisitorLogModel.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // Recent 50 live visitor logs
      VisitorLogModel.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .select("path ip country city device browser os referrerDomain createdAt")
        .lean(),
    ]);

    // Fill all days in dailyTrend map even if zero views
    const dailyTrendMap = new Map<string, { views: number; uniqueVisitors: number }>();
    for (let i = 0; i < daysLimit; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dailyTrendMap.set(key, { views: 0, uniqueVisitors: 0 });
    }

    dailyTrendRaw.forEach((item: { _id: string; views: number; uniqueIps: string[] }) => {
      if (dailyTrendMap.has(item._id)) {
        dailyTrendMap.set(item._id, {
          views: item.views,
          uniqueVisitors: item.uniqueIps ? item.uniqueIps.length : 0,
        });
      }
    });

    const dailyTrend = Array.from(dailyTrendMap.entries()).map(([date, data]) => {
      const parsed = new Date(date);
      const label = parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return {
        date,
        label,
        views: data.views,
        uniqueVisitors: data.uniqueVisitors,
      };
    });

    const deviceMap: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
    devicesRaw.forEach((d: { _id: string; count: number }) => {
      if (d._id in deviceMap) deviceMap[d._id] = d.count;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalViews,
        totalUniqueVisitors: uniqueVisitorsArr.length,
        viewsToday,
        uniqueToday: uniqueTodayArr.length,
        viewsYesterday,
        dailyTrend,
        topPages: topPagesRaw.map((p) => ({ path: p._id, count: p.count })),
        topReferrers: topReferrersRaw.map((r) => ({ domain: r._id, count: r.count })),
        deviceBreakdown: deviceMap,
        browserBreakdown: browsersRaw.map((b) => ({ browser: b._id, count: b.count })),
        topCountries: topCountriesRaw.map((c) => ({ country: c._id, count: c.count })),
        recentLogs,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
