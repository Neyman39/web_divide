const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const productService = require('../services/product_service');
const passport = require('../middleware/passport');
const { requireRole } = require('../middleware/auth');

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

router.get('/api/switches', passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res) => {
  const data = await productService.getAllSwitches();
  res.json({ success: true, data });
}));

router.post(
  '/api/products',
  passport.authenticate('jwt', { session: false }),
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

router.get(
  '/api/admin/products',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const products = await productService.getAllProducts();
    res.json({ success: true, data: products });
  })
);

router.get(
  '/api/admin/products/:id',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id, 10);
    const product = await productService.getAdminProductById(productId);
    res.json({ success: true, product });
  })
);

router.post(
  '/api/admin/products',
  passport.authenticate('jwt', { session: false }),
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

router.put(
  '/api/admin/products/:id',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id, 10);
    const product = await productService.updateProduct(productId, req.body);
    res.json({
      success: true,
      message: 'Клавиатура обновлена',
      product,
    });
  })
);

router.delete(
  '/api/admin/products/:id',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id, 10);
    await productService.deleteProduct(productId);
    res.json({ success: true, message: 'Клавиатура удалена' });
  })
);

module.exports = router;
