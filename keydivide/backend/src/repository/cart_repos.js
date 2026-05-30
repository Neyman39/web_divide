const pool = require('../config/db');

class CartRepository {
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
    return rows;
  }

  async sumQuantityByUserAndProduct(userId, productId) {
    const { rows } = await pool.query(
      'SELECT COALESCE(SUM(quantity), 0) AS in_cart FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    return parseInt(rows[0].in_cart, 10);
  }

  async sumOtherQuantity(userId, productId, excludeCartItemId) {
    const { rows } = await pool.query(
      'SELECT COALESCE(SUM(quantity), 0) AS in_cart FROM cart_items WHERE user_id = $1 AND product_id = $2 AND id != $3',
      [userId, productId, excludeCartItemId]
    );
    return parseInt(rows[0].in_cart, 10);
  }

  async findById(cartItemId) {
    const { rows } = await pool.query('SELECT * FROM cart_items WHERE id = $1', [cartItemId]);
    return rows[0] || null;
  }

  async insert({ userId, productId, switchId, quantity, unitPrice }) {
    const { rows } = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, switch_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, productId, switchId || null, quantity, unitPrice]
    );
    return rows[0];
  }

  async updateQuantity(cartItemId, quantity) {
    const { rows } = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, cartItemId]
    );
    return rows[0] || null;
  }

  async deleteById(cartItemId) {
    const { rows } = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 RETURNING *',
      [cartItemId]
    );
    return rows[0] || null;
  }

  async findCartItemsForOrder(client, userId) {
    const query = `
      SELECT ci.id AS cart_item_id, ci.product_id, ci.switch_id, ci.quantity, ci.unit_price,
             p.name AS product_name, p.stock AS product_stock, p.base_price, p.switch_count,
             s.name AS switch_name, s.stock AS switch_stock, s.price_per_switch
      FROM cart_items ci
      JOIN products_demo p ON ci.product_id = p.id
      LEFT JOIN switches s ON ci.switch_id = s.id
      WHERE ci.user_id = $1
    `;
    const { rows } = await client.query(query, [userId]);
    return rows;
  }

  async clearByUserId(client, userId) {
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
  }
}

module.exports = new CartRepository();
