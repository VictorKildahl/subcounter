import { famousCreator, famousCreatorPlatform } from "@/auth-schema";
import { famousCreatorSeeds } from "@/data/famous-creators";
import { db } from "@/libs/db";
import { eq } from "drizzle-orm";

async function seedFamousCreators() {
  console.log("Seeding famous creators...");

  for (const seed of famousCreatorSeeds) {
    console.log(`Processing ${seed.name}...`);

    // Check if creator exists
    const existing = await db.query.famousCreator.findFirst({
      where: eq(famousCreator.id, seed.id),
    });

    if (existing) {
      console.log(`  ${seed.name} already exists, updating...`);
      await db
        .update(famousCreator)
        .set({
          name: seed.name,
          username: seed.username,
          avatarUrl: seed.avatarUrl,
          bio: seed.bio,
        })
        .where(eq(famousCreator.id, seed.id));
    } else {
      console.log(`  Creating ${seed.name}...`);
      await db.insert(famousCreator).values({
        id: seed.id,
        name: seed.name,
        username: seed.username,
        avatarUrl: seed.avatarUrl,
        bio: seed.bio,
      });
    }

    // Handle platforms
    for (let i = 0; i < seed.platforms.length; i++) {
      const p = seed.platforms[i];
      const platformId = `${seed.id}-${p.platform}`;

      const existingPlatform = await db.query.famousCreatorPlatform.findFirst({
        where: eq(famousCreatorPlatform.id, platformId),
      });

      if (existingPlatform) {
        console.log(`    Platform ${p.platform} exists, updating...`);
        await db
          .update(famousCreatorPlatform)
          .set({
            profileUrl: p.profileUrl,
            displayOrder: i,
          })
          .where(eq(famousCreatorPlatform.id, platformId));
      } else {
        console.log(`    Creating platform ${p.platform}...`);
        await db.insert(famousCreatorPlatform).values({
          id: platformId,
          creatorId: seed.id,
          platform: p.platform,
          profileUrl: p.profileUrl,
          displayOrder: i,
          followerCount: 0, // Will be fetched on first refresh
        });
      }
    }
  }

  console.log("Seeding complete!");
}

seedFamousCreators()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error seeding:", error);
    process.exit(1);
  });
