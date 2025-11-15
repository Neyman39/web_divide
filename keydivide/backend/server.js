const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const cors = require('cors');
const openapiSpec = require('./apidoc.json');

const app = express();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// const specs = swaggerJsdoc(options);

// Документация
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.use(cors());

// Настройки подключения к PostgreSQL
// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'my_shop',
//   password: '1234',
//   port: 5432,
// });

// Для тестов
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'shop_test',
  password: '1234',
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
      console.error('Error connecting to database:', err);
  } else {
      console.log('Connected to PostgreSQL database');
      release();
  }
});


app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Главная.html'));
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// // Роут для получения всех товаров
// app.get('/api/products', async (req, res) => {
//   try {
//     const { rows } = await pool.query('SELECT * FROM products');
//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server error');
//   }
// });

// Роут для получения всех товаров
app.get('/api/products', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.base_price,
        p.switch_count,
        (p.base_price + (s.price_per_switch * p.switch_count)) as price,
        i.image_url as img,
        CONCAT('product.html?id=', p.id) as link
      FROM products_demo p
      LEFT JOIN switches s ON p.base_switch_id = s.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 1
      LEFT JOIN images i ON pi.image_id = i.id
      ORDER BY p.id
    `;
    
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Регистрация пользователя
app.post('/register', async (req, res) => {
  try {
    const { login, email, surname, name, password } = req.body;
    
    // Проверка на существующего пользователя
    const userExists = await pool.query(
      'SELECT * FROM users WHERE login = $1 OR email = $2',
      [login, email]
    );
    
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким логином или email уже существует' });
    }
    
    // Хеширование пароля
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Создание пользователя
    const newUser = await pool.query(
      'INSERT INTO users (login, email, surname, name, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [login, email, surname, name, passwordHash]
    );
    
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Авторизация пользователя
app.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    
    // Поиск пользователя
    const user = await pool.query(
      'SELECT * FROM users WHERE login = $1',
      [login]
    );
    
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    
    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    
    // Успешная авторизация
    res.json({ 
      message: 'Авторизация успешна',
      user: {
        id: user.rows[0].id,
        login: user.rows[0].login,
        name: user.rows[0].name,
        surname: user.rows[0].surname,
        email: user.rows[0].email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавляем новый эндпоинт для проверки авторизации
app.get('/check-auth', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ isAuthenticated: false });

    // Здесь должна быть проверка JWT токена
    const user = await pool.query(
      'SELECT id, login, name, surname, email FROM users WHERE login = $1',
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ isAuthenticated: false });
    }

    res.json({ 
      isAuthenticated: true,
      user: user.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API Endpoint для получения данных продукта
app.get('/api/products/:id', async (req, res) => {
  let client;
  try {
      const productId = parseInt(req.params.id);
      console.log('Fetching product with ID:', productId);

      client = await pool.connect();

      // 1. Получаем основную информацию о продукте
      const productQuery = `
          SELECT 
              p.id,
              p.name,
              p.description,
              p.base_price,
              p.switch_count,
              p.base_switch_id,
              s.name as base_switch_name,
              s.type as base_switch_type,
              s.actuation_force as base_actuation_force,
              s.bottom_force as base_bottom_force,
              s.tactile_force as base_tactile_force,
              s.travel_length as base_travel_length,
              s.price_per_switch as base_price_per_switch,
              (p.base_price + (s.price_per_switch * p.switch_count)) as current_price
          FROM products_demo p
          LEFT JOIN switches s ON p.base_switch_id = s.id
          WHERE p.id = $1
      `;

      const productResult = await client.query(productQuery, [productId]);
      
      if (productResult.rows.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
      }

      const product = productResult.rows[0];
      console.log('Found product:', product.name);

      // 2. Получаем доступные свитчи для этого продукта с явным приведением типов
      const switchesQuery = `
          SELECT 
              s.id,
              s.name,
              s.type,
              s.actuation_force,
              s.bottom_force,
              s.tactile_force,
              s.travel_length,
              s.price_per_switch,
              p.switch_count,
              (s.price_per_switch * p.switch_count) as additional_price,
              (p.base_price + (s.price_per_switch * p.switch_count)) as total_price,
              pas.display_order,
              (s.id = p.base_switch_id) as is_default
          FROM product_available_switches pas
          JOIN switches s ON pas.switch_id = s.id
          JOIN products_demo p ON pas.product_id = p.id
          WHERE pas.product_id = $1
          ORDER BY pas.display_order
      `;

      const switchesResult = await client.query(switchesQuery, [productId]);
      console.log('Found switches:', switchesResult.rows.length);

      // 3. Получаем изображения
      const imagesQuery = `
          SELECT i.image_url, i.alt_text
          FROM product_images pi
          JOIN images i ON pi.image_id = i.id
          WHERE pi.product_id = $1
          ORDER BY pi.sort_order
      `;

      const imagesResult = await client.query(imagesQuery, [productId]);
      console.log('Found images:', imagesResult.rows.length);

      // 4. Получаем характеристики
      const specsQuery = `
          SELECT spec_key, spec_value, depends_on_switch, display_order
          FROM product_specifications
          WHERE product_id = $1
          ORDER BY display_order
      `;

      const specsResult = await client.query(specsQuery, [productId]);
      console.log('Found specifications:', specsResult.rows.length);

      // 5. Получаем комплектацию
      const equipmentQuery = `
          SELECT item_name
          FROM product_equipment
          WHERE product_id = $1
          ORDER BY display_order
      `;

      const equipmentResult = await client.query(equipmentQuery, [productId]);
      console.log('Found equipment:', equipmentResult.rows.length);

      // 6. Формируем финальный ответ
      const response = {
          id: product.id,
          name: product.name,
          description: product.description,
          base_price: parseFloat(product.base_price),
          current_price: parseFloat(product.current_price),
          switch_count: product.switch_count,
          images: imagesResult.rows.map(img => ({
              url: img.image_url,
              alt: img.alt_text
          })),
          available_switches: switchesResult.rows.map(sw => ({
              id: sw.id,
              name: sw.name,
              type: sw.type,
              actuation_force: sw.actuation_force,
              bottom_force: sw.bottom_force,
              tactile_force: sw.tactile_force,
              travel_length: sw.travel_length,
              price_per_switch: parseFloat(sw.price_per_switch),
              switch_count: parseInt(sw.switch_count),
              additional_price: parseFloat(sw.additional_price),
              total_price: parseFloat(sw.total_price),
              is_default: sw.is_default
          })),
          specifications: specsResult.rows.map(spec => ({
              key: spec.spec_key,
              value: spec.spec_value,
              depends_on_switch: spec.depends_on_switch
          })),
          equipment: equipmentResult.rows.map(eq => eq.item_name)
      };

      console.log('Sending response for product:', product.name);
      res.json(response);

  } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Internal server error: ' + error.message });
  } finally {
      if (client) {
          client.release();
      }
  }
});

// Endpoint для расчёта цены при смене свитча
app.get('/api/products/:id/price', async (req, res) => {
  try {
      const productId = parseInt(req.params.id);
      const switchId = parseInt(req.query.switch_id);

      const priceQuery = `
          SELECT 
              p.base_price,
              p.switch_count,
              s.price_per_switch,
              (p.base_price + (s.price_per_switch * p.switch_count)) as total_price,
              (s.price_per_switch * p.switch_count) as additional_price
          FROM products_demo p
          JOIN switches s ON s.id = $1
          WHERE p.id = $2
      `;

      const priceResult = await pool.query(priceQuery, [switchId, productId]);
      
      if (priceResult.rows.length === 0) {
          return res.status(404).json({ error: 'Product or switch not found' });
      }

      const priceData = priceResult.rows[0];
      res.json({
          base_price: parseFloat(priceData.base_price),
          total_price: parseFloat(priceData.total_price),
          additional_price: parseFloat(priceData.additional_price),
          switch_count: priceData.switch_count
      });

  } catch (error) {
      console.error('Error calculating price:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = 5000;
app.listen(PORT,() => {
  console.log('Server running on http://localhost:5000');
  console.log('Документация: http://localhost:5000/api-docs');
});


// const options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Мой API',
//       version: '1.0.0',
//       description: 'Документация к API интернет-магазина',
//     },
//     servers: [
//       {
//         url: 'http://localhost:5000',
//       },
//     ],
//   },
//   apis: ['./server.js'], // путь к вашему файлу с маршрутами (если файл называется server.js)
// };