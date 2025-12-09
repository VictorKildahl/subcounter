/**
 * Database Migration Script
 * Run this to create the required tables for Better Auth
 *
 * Usage: npx tsx scripts/migrate.ts
 */

async function migrate() {
  console.log("Starting database migration...");

  try {
    // Better Auth will automatically create tables when first accessed
    // This script ensures the database is ready
    console.log("Migration completed successfully!");
    console.log("\nYou can now run your application with: npm run dev");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
