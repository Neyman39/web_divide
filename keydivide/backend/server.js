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

// Удаление пользователя по email
app.delete('/users/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ error: 'Email обязателен' });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE email = $1 RETURNING id, login, email',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь с таким email не найден' });
    }
    
    // Сбросить последовательность
    await pool.query(
      'SELECT setval(pg_get_serial_sequence(\'users\', \'id\'), COALESCE(MAX(id), 0) + 1, false) FROM users'
    );
    
    res.json({ 
      message: 'Пользователь успешно удален',
      deletedUser: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  try {
    const { login, email, surname, name, password } = req.body;
    
    if (!login || !email || !surname || !name || !password) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Некорректный формат email' });
    }

    // Проверка на существующего пользователя
    const userExists = await pool.query(
      'SELECT * FROM users WHERE login = $1 OR email = $2',
      [login, email]
    );
    
    if (userExists.rows.length > 0) {
      // Уточним, что именно занято — email или логин
      const existing = userExists.rows[0];
      if (existing.email === email) {
        return res.status(400).json({ error: 'Пользователь с таким email уже зарегистрирован' });
      }
      if (existing.login === login) {
        return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
      }
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
    if (!token) return res.json({ 
        isAuthenticated: false,
        user: null
      });

    // Здесь должна быть проверка JWT токена
    const user = await pool.query(
      'SELECT id, login, name, surname, email FROM users WHERE login = $1',
      [token]
    );

    if (user.rows.length === 0) {
      return res.json({ 
        isAuthenticated: false,
        user: null
      });
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


// Основная информация о продукте (без свитчей)
app.get('/api/products/:id', async (req, res) => {
  let client;
  try {
      const productId = parseInt(req.params.id);
      console.log('Fetching basic product info for ID:', productId);

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

      // 2. Получаем изображения
      const imagesQuery = `
          SELECT i.image_url, i.alt_text
          FROM product_images pi
          JOIN images i ON pi.image_id = i.id
          WHERE pi.product_id = $1
          ORDER BY pi.sort_order
      `;

      const imagesResult = await client.query(imagesQuery, [productId]);
      console.log('Found images:', imagesResult.rows.length);

      // 3. Получаем характеристики
      const specsQuery = `
          SELECT spec_key, spec_value, depends_on_switch, display_order
          FROM product_specifications
          WHERE product_id = $1
          ORDER BY display_order
      `;

      const specsResult = await client.query(specsQuery, [productId]);
      console.log('Found specifications:', specsResult.rows.length);

      // 4. Получаем комплектацию
      const equipmentQuery = `
          SELECT item_name
          FROM product_equipment
          WHERE product_id = $1
          ORDER BY display_order
      `;

      const equipmentResult = await client.query(equipmentQuery, [productId]);
      console.log('Found equipment:', equipmentResult.rows.length);

      // 5. Формируем финальный ответ (без свитчей)
      const response = {
          id: product.id,
          name: product.name,
          description: product.description,
          base_price: parseFloat(product.base_price),
          current_price: parseFloat(product.current_price),
          switch_count: product.switch_count,
          base_switch_id: product.base_switch_id,
          base_switch_name: product.base_switch_name,
          base_switch_type: product.base_switch_type,
          images: imagesResult.rows.map(img => ({
              url: img.image_url,
              alt: img.alt_text
          })),
          specifications: specsResult.rows.map(spec => ({
              key: spec.spec_key,
              value: spec.spec_value,
              depends_on_switch: spec.depends_on_switch
          })),
          equipment: equipmentResult.rows.map(eq => eq.item_name)
      };

      console.log('Sending basic product info for:', product.name);
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

// Получение доступных свитчей для продукта
app.get('/api/products/:id/switches', async (req, res) => {
  let client;
  try {
      const productId = parseInt(req.params.id);
      console.log('Fetching switches for product ID:', productId);

      client = await pool.connect();

      // Получаем базовую информацию о продукте для расчетов
      const productQuery = `
          SELECT base_price, switch_count, base_switch_id 
          FROM products_demo 
          WHERE id = $1
      `;
      
      const productResult = await client.query(productQuery, [productId]);
      
      if (productResult.rows.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
      }

      const product = productResult.rows[0];

      // Получаем доступные свитчи с расчетами цен
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
              $1::decimal as switch_count,
              (s.price_per_switch * ($1::decimal)) as additional_price,
              ($2 + (s.price_per_switch * ($1::decimal))) as total_price,
              pas.display_order,
              (s.id = $3) as is_default
          FROM product_available_switches pas
          JOIN switches s ON pas.switch_id = s.id
          WHERE pas.product_id = $4
          ORDER BY pas.display_order
      `;

      const switchesResult = await client.query(switchesQuery, [
          product.switch_count,
          product.base_price,
          product.base_switch_id,
          productId
      ]);

      console.log('Found switches:', switchesResult.rows.length);

      const response = {
          product_id: productId,
          base_price: parseFloat(product.base_price),
          switch_count: product.switch_count,
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
          }))
      };

      res.json(response);

  } catch (error) {
      console.error('Error fetching switches:', error);
      res.status(500).json({ error: 'Internal server error: ' + error.message });
  } finally {
      if (client) {
          client.release();
      }
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