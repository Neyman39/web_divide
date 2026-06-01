const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const {
  uploadProductImage,
  uploadSwitchImage,
  productPublicPath,
  switchPublicPath,
} = require('../middleware/upload');
const passport = require('../middleware/passport');
const { requireRole } = require('../middleware/auth');
const AppError = require('../utils/AppError');

const router = express.Router();

function handleUpload(multerSingle) {
  return (req, res, next) => {
    multerSingle('image')(req, res, (err) => {
      if (err) {
        return next(new AppError(err.message || 'Ошибка загрузки файла', 400));
      }
      next();
    });
  };
}

router.post(
  '/api/admin/upload/product-image',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  handleUpload(uploadProductImage.single),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError('Файл изображения не передан', 400);
    res.status(201).json({
      success: true,
      url: `${productPublicPath}/${req.file.filename}`,
      filename: req.file.filename,
    });
  })
);

router.post(
  '/api/admin/upload/switch-image',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  handleUpload(uploadSwitchImage.single),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError('Файл изображения не передан', 400);
    res.status(201).json({
      success: true,
      url: `${switchPublicPath}/${req.file.filename}`,
      filename: req.file.filename,
    });
  })
);

module.exports = router;
