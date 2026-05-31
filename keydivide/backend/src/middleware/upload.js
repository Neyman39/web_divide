const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const UPLOADS_ROOT = path.join(__dirname, '../../../uploads');

function createImageUploader(subdir) {
  const uploadDir = path.join(UPLOADS_ROOT, subdir);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_MIME.has(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Допустимы только изображения: JPEG, PNG, WebP, GIF'));
      }
    },
  });

  return {
    single: upload.single.bind(upload),
    publicPath: `/uploads/${subdir}`,
  };
}

const uploadProductImage = createImageUploader('products');
const uploadSwitchImage = createImageUploader('switches');

module.exports = {
  uploadProductImage: { single: uploadProductImage.single },
  uploadSwitchImage: { single: uploadSwitchImage.single },
  productPublicPath: uploadProductImage.publicPath,
  switchPublicPath: uploadSwitchImage.publicPath,
};
