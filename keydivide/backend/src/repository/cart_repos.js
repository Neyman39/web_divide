// src/repositories/cart.repository.js
const pool = require('../config/db');

class CartRepository {
  /**
   * Получить все позиции корзины пользователя
   * @param {number} userId 
   * @returns {Promise<Array>}
   */
  async findByUserId(userId) {
    const query = `
      SELECT 
        ci.id,
        ci.product_id,
        ci.switch_id,
        ci.quantity,
        ci.unit_price,
        p.name AS product_name,
        s.name AS switch_name
      FROM cart_items ci
      JOIN products_demo p ON ci.product_id = p.id
      LEFT JOIN switches s ON ci.switch_id = s.id
      WHERE ci.user_id = $1
      ORDER BY ci.added_at
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows; // Возвращаем "сырые" данные, без трансформаций
  }
}

// Экспортируем один экземпляр (Singleton)
module.exports = new CartRepository();