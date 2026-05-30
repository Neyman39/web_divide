const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Копейки в БД хранятся как INTEGER; pg возвращает NUMERIC строками вида "10679200.00"
const toKopecks = (value) => Math.round(Number(value));

// Получить корзину пользователя (по user_id, временно передаётся в query)
router.get('/api/cart', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
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
    res.json(rows);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cart
router.get('/api/cart', asyncHandler(async (req, res) => {
  const userId = req.query.userId;
  const items = await cartService.getCart(userId);
  res.json(items);
}));

// Добавить в корзину
router.post('/api/cart/add', async (req, res) => {
  const { userId, productId, switchId, quantity } = req.body;
  if (!userId || !productId || quantity == null || quantity < 1) {
    return res.status(400).json({ error: 'userId, productId и quantity > 0 обязательны' });
  }

  try {
    // Проверка наличия товара и выбранного свитча
    const productQuery = 'SELECT stock, base_price, base_switch_id, switch_count FROM products_demo WHERE id = $1';
    const productResult = await pool.query(productQuery, [productId]);
    if (productResult.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const product = productResult.rows[0];

    // Сколько уже в корзине у этого пользователя
    const cartSumQuery = 'SELECT COALESCE(SUM(quantity), 0) as in_cart FROM cart_items WHERE user_id = $1 AND product_id = $2';
    const cartSumRes = await pool.query(cartSumQuery, [userId, productId]);
    const inCart = parseInt(cartSumRes.rows[0].in_cart);

    if (inCart + quantity > product.stock) {
      return res.status(400).json({ error: `Недостаточно товара. Доступно: ${product.stock - inCart}` });
    }

    let switchPrice = 0; // в копейках
    let usedSwitchId = switchId || product.base_switch_id;

    if (usedSwitchId) {
      const switchQuery = 'SELECT price_per_switch, stock FROM switches WHERE id = $1';
      const switchResult = await pool.query(switchQuery, [usedSwitchId]);
      if (switchResult.rows.length === 0) return res.status(404).json({ error: 'Switch not found' });
      const sw = switchResult.rows[0];
      if (sw.stock < quantity) {
        return res.status(400).json({ error: `Недостаточно свитчей "${sw.name}". Доступно: ${sw.stock}` });
      }
      switchPrice = sw.price_per_switch; // уже в копейках
    }

    // Расчет цены в копейках
    const unitPrice = toKopecks(
      Number(product.base_price) + Number(switchPrice) * Number(product.switch_count)
    );

    const insertQuery = `
      INSERT INTO cart_items (user_id, product_id, switch_id, quantity, unit_price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const { rows } = await pool.query(insertQuery, [userId, productId, usedSwitchId || null, quantity, unitPrice]);
    res.status(201).json(rows[0]); // unit_price в копейках
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить количество товара в корзине
router.put('/api/cart/update/:id', async (req, res) => {
  const cartItemId = parseInt(req.params.id);
  const { quantity } = req.body;
  if (!quantity || quantity < 0) return res.status(400).json({ error: 'quantity >= 0 required' });

  try {
    if (quantity === 0) {
      const delRes = await pool.query('DELETE FROM cart_items WHERE id = $1 RETURNING *', [cartItemId]);
      if (delRes.rows.length === 0) return res.status(404).json({ error: 'Cart item not found' });
      return res.json({ message: 'Item removed', item: delRes.rows[0] });
    }

    // Текущая позиция
    const itemRes = await pool.query('SELECT * FROM cart_items WHERE id = $1', [cartItemId]);
    if (itemRes.rows.length === 0) return res.status(404).json({ error: 'Cart item not found' });
    const item = itemRes.rows[0];

    // Проверка товара
    const prodRes = await pool.query('SELECT stock FROM products_demo WHERE id = $1', [item.product_id]);
    if (prodRes.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const productStock = prodRes.rows[0].stock;

    // Сколько ещё в корзине кроме этого элемента
    const otherRes = await pool.query(
      'SELECT COALESCE(SUM(quantity), 0) as in_cart FROM cart_items WHERE user_id = $1 AND product_id = $2 AND id != $3',
      [item.user_id, item.product_id, cartItemId]
    );
    const otherInCart = parseInt(otherRes.rows[0].in_cart);

    if (otherInCart + quantity > productStock) {
      return res.status(400).json({ error: `Недостаточно товара. Доступно: ${productStock - otherInCart}` });
    }

    // Проверка свитчей
    if (item.switch_id) {
      const switchRes = await pool.query('SELECT stock, name FROM switches WHERE id = $1', [item.switch_id]);
      if (switchRes.rows.length === 0) return res.status(404).json({ error: 'Switch not found' });
      const sw = switchRes.rows[0];
      if (sw.stock < quantity) {
        return res.status(400).json({ error: `Недостаточно свитчей "${sw.name}". Доступно: ${sw.stock}` });
      }
    }

    const updRes = await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *', [quantity, cartItemId]);
    res.json(updRes.rows[0]);
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить позицию из корзины
router.delete('/api/cart/remove/:id', async (req, res) => {
  const cartItemId = parseInt(req.params.id);
  try {
    const { rows } = await pool.query('DELETE FROM cart_items WHERE id = $1 RETURNING *', [cartItemId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Cart item not found' });
    res.json({ message: 'Item removed', item: rows[0] });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;