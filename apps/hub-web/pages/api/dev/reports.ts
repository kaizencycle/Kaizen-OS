import type { NextApiRequest, NextApiResponse } from "next";

type ReportData = {
  ok: boolean;
  reports: Array<{
    id: string;
    title: string;
    type: "daily" | "weekly" | "monthly";
    createdAt: string;
    status: "completed" | "processing" | "failed";
    summary: {
      totalEvents: number;
      successRate: number;
      avgProcessingTime: number;
    };
  }>;
  generatedAt: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Mock reports data - in a real app, this would come from a database
    const mockReports: ReportData = {
      ok: true,
      reports: [
        {
          id: "daily-2024-01-15",
          title: "Daily Operations Report",
          type: "daily",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          status: "completed",
          summary: {
            totalEvents: 1247,
            successRate: 0.987,
            avgProcessingTime: 145
          }
        },
        {
          id: "weekly-2024-w03",
          title: "Weekly System Summary",
          type: "weekly",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          status: "completed",
          summary: {
            totalEvents: 8734,
            successRate: 0.992,
            avgProcessingTime: 132
          }
        },
        {
          id: "monthly-2024-01",
          title: "Monthly Analytics",
          type: "monthly",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
          status: "completed",
          summary: {
            totalEvents: 45678,
            successRate: 0.985,
            avgProcessingTime: 158
          }
        },
        {
          id: "daily-2024-01-16",
          title: "Daily Operations Report",
          type: "daily",
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          status: "processing",
          summary: {
            totalEvents: 0,
            successRate: 0,
            avgProcessingTime: 0
          }
        }
      ],
      generatedAt: new Date().toISOString()
    };

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
    return res.status(200).json(mockReports);
  } catch (error: any) {
    return res.status(500).json({ 
      error: "reports_load_failed", 
      message: error?.message || "Unknown error" 
    });
  }
}

