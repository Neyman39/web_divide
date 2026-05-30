const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const productService = require('../services/product_service');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/api/products', asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts();
  res.json(products);
}));

router.get('/api/products/:id', asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = await productService.getProductById(productId);
  res.json(product);
}));

router.get('/api/products/:id/switches', asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const switches = await productService.getProductSwitches(productId);
  res.json(switches);
}));

router.get('/api/switches', authenticateToken, asyncHandler(async (req, res) => {
  const data = await productService.getAllSwitches();
  res.json({ success: true, data });
}));

router.post(
  '/api/products',
  authenticateToken,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: 'Клавиатура успешно добавлена',
      product,
    });
  })
);

module.exports = router;
