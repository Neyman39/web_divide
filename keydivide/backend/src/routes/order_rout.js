const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const orderService = require('../services/order_service');

const router = express.Router();

router.post('/api/orders', asyncHandler(async (req, res) => {
  const { userId, userEmail, userName, userLogin } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId обязателен' });
  }

  const { order, items } = await orderService.createOrder(userId, {
    userEmail,
    userName,
    userLogin,
  });

  res.status(201).json({
    order: {
      id: order.id,
      user_id: userId,
      total: order.total,
      status: order.status,
      created_at: order.created_at,
    },
    items: items.map((i) => ({
      ...i,
      unit_price: i.unit_price,
    })),
  });
}));

router.get('/api/orders', asyncHandler(async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'userId обязателен' });
  }

  const orders = await orderService.getOrdersByUserId(userId);
  res.json(orders);
}));

module.exports = router;
