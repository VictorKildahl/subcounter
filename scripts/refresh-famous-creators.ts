import { famousCreatorPlatform } from "@/auth-schema";
import { db } from "@/libs/db";
import { eq } from "drizzle-orm";

const BACKEND_URL = process.env.BACKEND_URL || "";

async function scrapeProfile(platform: string, url: string) {
  const response = await fetch(`${BACKEND_URL}/subcounter/scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform, url }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to scrape ${platform}: ${response.statusText} - ${errorText}`
    );
  }

  const result = await response.json();
  // Backend may return { data: {...} } or just {...}
  return result.data || result;
}

async function refreshAllFamousCreators() {
  console.log("Refreshing famous creators...\n");

  const creators = await db.query.famousCreator.findMany({
    with: { platforms: true },
  });

  for (const creator of creators) {
    console.log(`\n📌 ${creator.name}`);

    for (const platform of creator.platforms) {
      try {
        console.log(`  Scraping ${platform.platform}...`);
        const data = await scrapeProfile(
          platform.platform,
          platform.profileUrl
        );

        if (!data || data.followerCount === undefined) {
          console.error(
            `  ✗ ${platform.platform}: No follower count in response`,
            data
          );
          continue;
        }

        await db
          .update(famousCreatorPlatform)
          .set({
            followerCount: data.followerCount,
            avatarUrl: data.avatarUrl || platform.avatarUrl,
            lastScrapedAt: new Date(),
          })
          .where(eq(famousCreatorPlatform.id, platform.id));

        console.log(
          `  ✓ ${
            platform.platform
          }: ${data.followerCount.toLocaleString()} followers`
        );
      } catch (error) {
        console.error(
          `  ✗ ${platform.platform}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  }

  console.log("\n✅ Refresh complete!");
  process.exit(0);
}

refreshAllFamousCreators();
