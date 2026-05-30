const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const cartService = require('../services/cart_service');

const router = express.Router();

router.get('/api/cart', asyncHandler(async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const items = await cartService.getCart(userId);
  res.json(items);
}));

router.post('/api/cart/add', asyncHandler(async (req, res) => {
  const { userId, productId, switchId, quantity } = req.body;
  if (!userId || !productId || quantity == null || quantity < 1) {
    return res.status(400).json({ error: 'userId, productId и quantity > 0 обязательны' });
  }

  const item = await cartService.addToCart({ userId, productId, switchId, quantity });
  res.status(201).json(item);
}));

router.put('/api/cart/update/:id', asyncHandler(async (req, res) => {
  const cartItemId = parseInt(req.params.id, 10);
  const { quantity } = req.body;
  if (quantity == null || quantity < 0) {
    return res.status(400).json({ error: 'quantity >= 0 required' });
  }

  const result = await cartService.updateCartItem(cartItemId, quantity);
  if (result.removed) {
    return res.json({ message: 'Item removed', item: result.item });
  }
  res.json(result.item);
}));

router.delete('/api/cart/remove/:id', asyncHandler(async (req, res) => {
  const cartItemId = parseInt(req.params.id, 10);
  const item = await cartService.removeCartItem(cartItemId);
  res.json({ message: 'Item removed', item });
}));

module.exports = router;
