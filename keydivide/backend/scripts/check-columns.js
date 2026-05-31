require('dotenv').config();
const pool = require('../src/config/db');

pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'switches' ORDER BY 1")
  .then((r) => {
    console.log(r.rows.map((x) => x.column_name).join(', '));
    return pool.end();
  })
  .catch((e) => {
    console.error(e);
    pool.end();
  });
