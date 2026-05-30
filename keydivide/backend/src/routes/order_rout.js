const express = require('express');
const pool = require('../config/db');
const { sendOrderConfirmation } = require('../services/emailService');

const router = express.Router();

const toKopecks = (value) => Math.round(Number(value));

const { formatPriceRub } = require('../utils/authHelpers');

router.post('/api/orders', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId обязателен' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Корзина
    const cartQuery = `
      SELECT ci.id AS cart_item_id, ci.product_id, ci.switch_id, ci.quantity, ci.unit_price,
             p.name AS product_name, p.stock AS product_stock, p.base_price, p.switch_count,
             s.name AS switch_name, s.stock AS switch_stock, s.price_per_switch
      FROM cart_items ci
      JOIN products_demo p ON ci.product_id = p.id
      LEFT JOIN switches s ON ci.switch_id = s.id
      WHERE ci.user_id = $1
    `;
    const cartResult = await client.query(cartQuery, [userId]);
    const cartItems = cartResult.rows;

    const userResult = await client.query('SELECT email, name, login FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (cartItems.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Корзина пуста' });
    }

    // 2. Блокируем товары и свитчи для атомарной проверки
    for (const item of cartItems) {
      const productLock = await client.query('SELECT stock FROM products_demo WHERE id = $1 FOR UPDATE', [item.product_id]);
      const productStock = productLock.rows[0].stock;
      if (item.quantity > productStock) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Недостаточно товара "${item.product_name}". Доступно: ${productStock}` });
      }

      if (item.switch_id) {
        const switchLock = await client.query('SELECT stock FROM switches WHERE id = $1 FOR UPDATE', [item.switch_id]);
        const switchStock = switchLock.rows[0].stock;
        if (item.quantity > switchStock) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Недостаточно свитчей "${item.switch_name}". Доступно: ${switchStock}` });
        }
      }
    }

    // 3. Создаём заказ
    const total = cartItems.reduce(
      (sum, item) => sum + toKopecks(item.unit_price) * toKopecks(item.quantity),
      0
    );
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING id, total, status, created_at',
      [userId, toKopecks(total), 'pending']
    );
    const order = orderResult.rows[0];

    // 4. Переносим позиции и списываем остатки
    for (const item of cartItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, switch_id, quantity, unit_price) VALUES ($1, $2, $3, $4, $5)',
        [order.id, item.product_id, item.switch_id, item.quantity, toKopecks(item.unit_price)]
      );

      // Атомарное уменьшение товара
      await client.query('UPDATE products_demo SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]);

      // Атомарное уменьшение свитчей
      if (item.switch_id) {
        await client.query('UPDATE switches SET stock = stock - $1 WHERE id = $2', [item.quantity, item.switch_id]);
      }
    }

    // 5. Очищаем корзину
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    await client.query('COMMIT');

    // 6. Получаем состав заказа
    const itemsQuery = `
      SELECT oi.quantity, oi.unit_price, p.name AS product_name, s.name AS switch_name
      FROM order_items oi
      JOIN products_demo p ON oi.product_id = p.id
      LEFT JOIN switches s ON oi.switch_id = s.id
      WHERE oi.order_id = $1
    `;
    const itemsResult = await client.query(itemsQuery, [order.id]);

    sendOrderConfirmation({
      user: { 
        email: req.body.userEmail, // передаем email пользователя в теле запроса
        name: req.body.userName || 'Покупатель',
        login: req.body.userLogin 
      },
      order,
      items: itemsResult.rows,
      shopInfo: {
        name: 'MyShop',
        address: 'ул. Примерная, 1, Москва' // замените на реальные данные
      }
    }).catch(err => {
      // Ошибка отправки письма НЕ должна ломать заказ
      console.error('❌ Failed to send order confirmation email:', err.message);
    });

    res.status(201).json({
      order: {
        id: order.id,
        user_id: userId,
        total: order.total,      // копейки
        status: order.status,
        created_at: order.created_at
      },
      items: itemsResult.rows.map(i => ({
        ...i,
        unit_price: i.unit_price // копейки
      }))
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Order error:', err);
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  } finally {
    client.release();
  }
});

// Получить заказы пользователя
router.get('/api/orders', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId обязателен' });

  try {
    // Все заказы пользователя с основной информацией
    const ordersQuery = `
      SELECT id, total, status, created_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const { rows: orders } = await pool.query(ordersQuery, [userId]);

    // Для каждого заказа подгружаем состав
    const result = [];
    for (const order of orders) {
      const itemsQuery = `
        SELECT oi.quantity, oi.unit_price,
               p.name AS product_name,
               s.name AS switch_name
        FROM order_items oi
        JOIN products_demo p ON oi.product_id = p.id
        LEFT JOIN switches s ON oi.switch_id = s.id
        WHERE oi.order_id = $1
      `;
      const { rows: items } = await pool.query(itemsQuery, [order.id]);
      result.push({
        id: order.id,
        total: order.total,
        status: order.status,
        created_at: order.created_at,
        items: items
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Ошибка получения заказов' });
  }
});
module.exports = router;