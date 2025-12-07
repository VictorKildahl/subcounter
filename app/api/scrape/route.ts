import { platform, platformMetric } from "@/auth-schema";
import { auth } from "@/libs/auth";
import { db } from "@/libs/db";
import { PlatformType } from "@/types/types";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { platform: platformType, url } = body;

    // Validate input
    if (!platformType || !url) {
      return NextResponse.json(
        { error: "Platform and URL are required" },
        { status: 400 }
      );
    }

    // Validate platform
    if (!Object.values(PlatformType).includes(platformType)) {
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
      body: JSON.stringify({ platform: platformType, url }),
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
    const scrapedData = result.data || result;

    // Check if platform already exists for this user
    const existingPlatform = await db.query.platform.findFirst({
      where: and(
        eq(platform.userId, session.user.id),
        eq(platform.platform, platformType)
      ),
    });

    let platformRecord;
    let growth24h = 0;

    if (existingPlatform) {
      // Calculate growth
      const oldCount = existingPlatform.followerCount;
      const newCount = scrapedData.followerCount;
      growth24h = oldCount > 0 ? ((newCount - oldCount) / oldCount) * 100 : 0;

      // Update existing platform
      const [updated] = await db
        .update(platform)
        .set({
          handle: scrapedData.handle,
          profileUrl: url,
          avatarUrl: scrapedData.avatarUrl || existingPlatform.avatarUrl || "",
          followerCount: scrapedData.followerCount,
          growth24h: parseFloat(growth24h.toFixed(2)),
          updatedAt: new Date(),
        })
        .where(eq(platform.id, existingPlatform.id))
        .returning();

      platformRecord = updated;

      // Save new metric
      await db.insert(platformMetric).values({
        id: crypto.randomUUID(),
        platformId: updated.id,
        followerCount: scrapedData.followerCount,
        timestamp: new Date(),
      });
    } else {
      // Create new platform
      const [newPlatform] = await db
        .insert(platform)
        .values({
          id: crypto.randomUUID(),
          userId: session.user.id,
          platform: platformType,
          handle: scrapedData.handle,
          profileUrl: url,
          avatarUrl: scrapedData.avatarUrl || "",
          followerCount: scrapedData.followerCount,
          growth24h: 0,
          connected: true,
          displayOrder: 0,
        })
        .returning();

      platformRecord = newPlatform;

      // Save initial metric
      await db.insert(platformMetric).values({
        id: crypto.randomUUID(),
        platformId: newPlatform.id,
        followerCount: scrapedData.followerCount,
        timestamp: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        platform: platformType,
        url,
        followerCount: scrapedData.followerCount,
        handle: scrapedData.handle,
        avatarUrl: scrapedData.avatarUrl,
      },
      platformRecord,
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
