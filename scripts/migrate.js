const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : undefined,
});

async function main() {
  try {
    await pool.query(
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;"
    );
    console.log("Added is_approved column");

    await pool.query(
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS submitted_by INTEGER REFERENCES users(id);"
    );
    console.log("Added submitted_by column");

    await pool.query(
      "UPDATE properties SET is_approved = true WHERE is_approved IS NULL;"
    );
    console.log("Updated existing rows");

    await pool.end();
    console.log("Migration complete!");
  } catch (e) {
    console.error("Migration error:", e);
    await pool.end();
  }
}

main();
