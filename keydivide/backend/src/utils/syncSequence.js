const pool = require('../config/db');

/** Таблицы с SERIAL-колонкой id, для которых синхронизируем sequence. */
const ALLOWED_TABLES = new Set([
  'switches',
  'products_demo',
  'images',
  'users',
  'product_equipment',
  'product_specifications',
  'product_images',
]);

/**
 * Синхронизирует SERIAL/sequence с MAX(id) в таблице.
 * Нужно после ручных INSERT с явным id или DELETE, иначе следующий INSERT
 * может получить уже занятый id (ошибка 23505).
 */
async function syncSequence(tableName, client = null) {
  if (!ALLOWED_TABLES.has(tableName)) {
    throw new Error(`Sync sequence not allowed for table: ${tableName}`);
  }

  const query = `
    SELECT setval(
      pg_get_serial_sequence('${tableName}', 'id'),
      COALESCE((SELECT MAX(id) FROM ${tableName}), 0) + 1,
      false
    )
    WHERE pg_get_serial_sequence('${tableName}', 'id') IS NOT NULL
  `;

  const runner = client || pool;
  await runner.query(query);
}

async function syncSequences(tableNames, client = null) {
  for (const tableName of tableNames) {
    await syncSequence(tableName, client);
  }
}

module.exports = { syncSequence, syncSequences };
