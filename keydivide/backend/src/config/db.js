const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'shop_test',
  password: process.env.DB_PASSWORD || '1234',
  port: process.env.DB_PORT || 5432,
});

async function runSchemaPatches(client) {
  await client.query(`
    ALTER TABLE switches
    ADD COLUMN IF NOT EXISTS image_url TEXT
  `);
  await client.query(`
    UPDATE switches
    SET type = 'линейные тихие'
    WHERE type ILIKE '%кликающ%'
  `);
}

pool.connect(async (err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }

  try {
    await runSchemaPatches(client);
    console.log('Connected to PostgreSQL database');
  } catch (patchErr) {
    console.error('Database schema patch failed:', patchErr);
  } finally {
    release();
  }
});

module.exports = pool;