import { PlatformType } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, url } = body;

    // Validate input
    if (!platform || !url) {
      return NextResponse.json(
        { error: "Platform and URL are required" },
        { status: 400 }
      );
    }

    // Validate platform
    if (!Object.values(PlatformType).includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Call Heroku backend to scrape the profile
    const response = await fetch(`${BACKEND_URL}/subcounter/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ platform, url }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      console.error("Backend scraping error:", errorData);
      return NextResponse.json(
        {
          error: "Failed to scrape profile",
          details:
            errorData.error || errorData.details || "Backend request failed",
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        platform,
        url,
        ...result,
      },
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      {
        error: "Failed to scrape profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
