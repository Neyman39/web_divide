const pool = require('../config/db');

class OrderRepository {
  async findByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT id, total, status, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }

  async findItemsByOrderId(orderId) {
    const { rows } = await pool.query(
      `SELECT oi.quantity, oi.unit_price,
              p.name AS product_name,
              s.name AS switch_name
       FROM order_items oi
       JOIN products_demo p ON oi.product_id = p.id
       LEFT JOIN switches s ON oi.switch_id = s.id
       WHERE oi.order_id = $1`,
      [orderId]
    );
    return rows;
  }

  async findUserContact(client, userId) {
    const { rows } = await client.query(
      'SELECT email, name, login FROM users WHERE id = $1',
      [userId]
    );
    return rows[0] || null;
  }

  async createOrder(client, userId, total) {
    const { rows } = await client.query(
      'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING id, total, status, created_at',
      [userId, total, 'pending']
    );
    return rows[0];
  }

  async insertOrderItem(client, { orderId, productId, switchId, quantity, unitPrice }) {
    await client.query(
      'INSERT INTO order_items (order_id, product_id, switch_id, quantity, unit_price) VALUES ($1, $2, $3, $4, $5)',
      [orderId, productId, switchId, quantity, unitPrice]
    );
  }

  async findOrderItemsForEmail(client, orderId) {
    const { rows } = await client.query(
      `SELECT oi.quantity, oi.unit_price, p.name AS product_name, s.name AS switch_name
       FROM order_items oi
       JOIN products_demo p ON oi.product_id = p.id
       LEFT JOIN switches s ON oi.switch_id = s.id
       WHERE oi.order_id = $1`,
      [orderId]
    );
    return rows;
  }
}

module.exports = new OrderRepository();
