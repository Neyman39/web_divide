const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('../apidoc.json'); // Убедитесь, что путь верный
const passport = require('./middleware/passport');

const authRoutes = require('./routes/auth_rout');
const productRoutes = require('./routes/product_rout');
const cartRoutes = require('./routes/cart_rout');
const orderRoutes = require('./routes/order_rout');
const userRoutes = require('./routes/user_rout');
const switchRoutes = require('./routes/switch_rout');
const uploadRoutes = require('./routes/upload_rout');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, '../..')));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(openapiSpec);
});

// Main Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../..', 'Главная.html'));
});

// Routes
app.use(authRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(orderRoutes);
app.use(userRoutes);
app.use(switchRoutes);
app.use(uploadRoutes);

app.use(errorHandler);

module.exports = app;