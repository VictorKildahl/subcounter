import { famousCreator } from "@/auth-schema";
import { FamousCreator } from "@/data/famous-creators";
import { db } from "@/libs/db";
import { eq } from "drizzle-orm";

export async function getAllFamousCreators(): Promise<FamousCreator[]> {
  const creators = await db.query.famousCreator.findMany({
    with: {
      platforms: {
        orderBy: (platforms, { asc }) => [asc(platforms.displayOrder)],
      },
    },
  });

  return creators.map((creator) => ({
    id: creator.id,
    name: creator.name,
    username: creator.username,
    avatarUrl: creator.avatarUrl,
    bio: creator.bio,
    platforms: creator.platforms.map((p) => ({
      platform: p.platform,
      handle: p.handle,
      profileUrl: p.profileUrl,
      avatarUrl: p.avatarUrl,
      followerCount: p.followerCount,
    })),
  }));
}

export async function getFamousCreatorByUsername(
  username: string
): Promise<FamousCreator | null> {
  const creator = await db.query.famousCreator.findFirst({
    where: eq(famousCreator.username, username),
    with: {
      platforms: {
        orderBy: (platforms, { asc }) => [asc(platforms.displayOrder)],
      },
    },
  });

  if (!creator) {
    return null;
  }

  return {
    id: creator.id,
    name: creator.name,
    username: creator.username,
    avatarUrl: creator.avatarUrl,
    bio: creator.bio,
    platforms: creator.platforms.map((p) => ({
      platform: p.platform,
      handle: p.handle,
      profileUrl: p.profileUrl,
      avatarUrl: p.avatarUrl,
      followerCount: p.followerCount,
    })),
  };
}
