import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Platform table - stores user's connected social platforms
export const platform = pgTable(
  "platform",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(), // YouTube, X, Instagram, etc.
    handle: text("handle").notNull(),
    profileUrl: text("profile_url").notNull(),
    avatarUrl: text("avatar_url"),
    followerCount: integer("follower_count").notNull().default(0),
    growth24h: real("growth_24h").notNull().default(0),
    connected: boolean("connected").notNull().default(true),
    hidden: boolean("hidden").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("platform_userId_idx").on(table.userId),
    index("platform_userId_platform_idx").on(table.userId, table.platform),
  ]
);

// Platform Metric table - stores historical follower data for tracking growth
export const platformMetric = pgTable(
  "platform_metric",
  {
    id: text("id").primaryKey(),
    platformId: text("platform_id")
      .notNull()
      .references(() => platform.id, { onDelete: "cascade" }),
    followerCount: integer("follower_count").notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => [
    index("platformMetric_platformId_idx").on(table.platformId),
    index("platformMetric_platformId_timestamp_idx").on(
      table.platformId,
      table.timestamp
    ),
  ]
);

export const platformRelations = relations(platform, ({ one, many }) => ({
  user: one(user, {
    fields: [platform.userId],
    references: [user.id],
  }),
  metrics: many(platformMetric),
}));

export const platformMetricRelations = relations(platformMetric, ({ one }) => ({
  platform: one(platform, {
    fields: [platformMetric.platformId],
    references: [platform.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  platforms: many(platform),
}));

// Famous Creator table - stores public creator profiles for the homepage
export const famousCreator = pgTable(
  "famous_creator",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    username: text("username").notNull().unique(), // URL slug
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("famousCreator_username_idx").on(table.username)]
);

// Famous Creator Platform table - stores platforms for famous creators
export const famousCreatorPlatform = pgTable(
  "famous_creator_platform",
  {
    id: text("id").primaryKey(),
    creatorId: text("creator_id")
      .notNull()
      .references(() => famousCreator.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(), // YouTube, X, Instagram, etc.
    handle: text("handle"),
    profileUrl: text("profile_url").notNull(),
    avatarUrl: text("avatar_url"),
    followerCount: integer("follower_count").notNull().default(0),
    displayOrder: integer("display_order").notNull().default(0),
    lastScrapedAt: timestamp("last_scraped_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("famousCreatorPlatform_creatorId_idx").on(table.creatorId),
    index("famousCreatorPlatform_creatorId_platform_idx").on(
      table.creatorId,
      table.platform
    ),
  ]
);

export const famousCreatorRelations = relations(famousCreator, ({ many }) => ({
  platforms: many(famousCreatorPlatform),
}));

export const famousCreatorPlatformRelations = relations(
  famousCreatorPlatform,
  ({ one }) => ({
    creator: one(famousCreator, {
      fields: [famousCreatorPlatform.creatorId],
      references: [famousCreator.id],
    }),
  })
);
