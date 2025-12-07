import { platform, platformMetric } from "@/auth-schema";
import { auth } from "@/libs/auth";
import { db } from "@/libs/db";
import { PlatformType } from "@/types/types";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch all platforms for the authenticated user
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPlatforms = await db.query.platform.findMany({
      where: eq(platform.userId, session.user.id),
      orderBy: [platform.displayOrder, platform.createdAt],
      with: {
        metrics: {
          orderBy: [desc(platformMetric.timestamp)],
          limit: 30, // Get last 30 metrics for history
        },
      },
    });

    return NextResponse.json({ platforms: userPlatforms });
  } catch (error) {
    console.error("Failed to fetch platforms:", error);
    return NextResponse.json(
      { error: "Failed to fetch platforms" },
      { status: 500 }
    );
  }
}

// POST - Create or update a platform
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      platform: platformType,
      handle,
      profileUrl,
      avatarUrl,
      followerCount,
      growth24h,
      connected,
      displayOrder,
    } = body;

    // Validate platform type
    if (!Object.values(PlatformType).includes(platformType)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    // Check if platform already exists for this user
    const existingPlatform = await db.query.platform.findFirst({
      where: and(
        eq(platform.userId, session.user.id),
        eq(platform.platform, platformType)
      ),
    });

    let platformRecord;

    if (existingPlatform) {
      // Update existing platform
      const [updated] = await db
        .update(platform)
        .set({
          handle,
          profileUrl,
          avatarUrl,
          followerCount,
          growth24h: growth24h || 0,
          connected: connected !== undefined ? connected : true,
          displayOrder: displayOrder || existingPlatform.displayOrder,
          updatedAt: new Date(),
        })
        .where(eq(platform.id, existingPlatform.id))
        .returning();

      platformRecord = updated;

      // Save metric
      await db.insert(platformMetric).values({
        id: crypto.randomUUID(),
        platformId: updated.id,
        followerCount,
        timestamp: new Date(),
      });
    } else {
      // Create new platform
      const [newPlatform] = await db
        .insert(platform)
        .values({
          id: id || crypto.randomUUID(),
          userId: session.user.id,
          platform: platformType,
          handle,
          profileUrl,
          avatarUrl,
          followerCount,
          growth24h: growth24h || 0,
          connected: connected !== undefined ? connected : true,
          displayOrder: displayOrder || 0,
        })
        .returning();

      platformRecord = newPlatform;

      // Save initial metric
      await db.insert(platformMetric).values({
        id: crypto.randomUUID(),
        platformId: newPlatform.id,
        followerCount,
        timestamp: new Date(),
      });
    }

    return NextResponse.json({ platform: platformRecord });
  } catch (error) {
    console.error("Failed to save platform:", error);
    return NextResponse.json(
      { error: "Failed to save platform" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a platform
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platformId = searchParams.get("id");

    if (!platformId) {
      return NextResponse.json(
        { error: "Platform ID required" },
        { status: 400 }
      );
    }

    // Verify platform belongs to user
    const platformToDelete = await db.query.platform.findFirst({
      where: and(
        eq(platform.id, platformId),
        eq(platform.userId, session.user.id)
      ),
    });

    if (!platformToDelete) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 }
      );
    }

    // Delete platform (metrics will be cascade deleted)
    await db.delete(platform).where(eq(platform.id, platformId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete platform:", error);
    return NextResponse.json(
      { error: "Failed to delete platform" },
      { status: 500 }
    );
  }
}

// PATCH - Update platform order or other properties
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { platforms: platformsToUpdate } = body;

    if (!Array.isArray(platformsToUpdate)) {
      return NextResponse.json(
        { error: "Platforms array required" },
        { status: 400 }
      );
    }

    // Update display order and/or hidden state for each platform
    for (const p of platformsToUpdate) {
      const updateData: {
        updatedAt: Date;
        displayOrder?: number;
        hidden?: boolean;
      } = {
        updatedAt: new Date(),
      };

      if (p.displayOrder !== undefined) {
        updateData.displayOrder = p.displayOrder;
      }

      if (p.hidden !== undefined) {
        updateData.hidden = p.hidden;
      }

      await db
        .update(platform)
        .set(updateData)
        .where(
          and(eq(platform.id, p.id), eq(platform.userId, session.user.id))
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update platforms:", error);
    return NextResponse.json(
      { error: "Failed to update platforms" },
      { status: 500 }
    );
  }
}
