require('dotenv').config();
const pool = require('../src/config/db');

async function migrate() {
  await pool.query(`
    ALTER TABLE switches
    ADD COLUMN IF NOT EXISTS image_url TEXT
  `);
  console.log('Migration OK: switches.image_url');
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  pool.end();
  process.exit(1);
});
