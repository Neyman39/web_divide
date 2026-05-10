require('dotenv').config();

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const cors = require('cors');
const openapiSpec = require('./apidoc.json');

const app = express();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { authenticateToken, authenticateRefreshToken, requireRole } = require('./middleware/auth');

app.use(cookieParser());

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
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'shop_test',
  password: process.env.DB_PASSWORD || '1234',
  port: process.env.DB_PORT || 5432,
});

// Добавьте после подключения к БД, перед роутами
function generateTokens(user) {
  const accessToken = jwt.sign(
    { 
      userId: user.id, 
      login: user.login,
      role: user.role || 'user' 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
}

function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production';
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 минут
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
  });
}

function clearAuthCookies(res) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}

// Добавьте после подключения к БД, перед роутами
function generateTokens(user) {
  const accessToken = jwt.sign(
    { 
      userId: user.id, 
      login: user.login,
      role: user.role || 'user' 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
}

function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production';
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 минут
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
  });
}

function clearAuthCookies(res) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}

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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток на один IP
  message: { error: 'Слишком много попыток, попробуйте позже' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Регистрация пользователя
app.post('/api/register', authLimiter, async (req, res) => {
  try {
    const { login, email, surname, name, password } = req.body;
    
    // Валидация полей
    if (!login || !email || !surname || !name || !password) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Некорректный формат email' });
    }

    // Валидация пароля
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Пароль должен содержать минимум 8 символов' 
      });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ 
        error: 'Пароль должен содержать заглавные и строчные буквы, а также цифры' 
      });
    }

    // Проверка на существующего пользователя
    const userExists = await pool.query(
      'SELECT login, email FROM users WHERE login = $1 OR email = $2',
      [login, email]
    );

    if (userExists.rows.length > 0) {
      const existing = userExists.rows[0];
      if (existing.email === email) {
        return res.status(400).json({ error: 'Пользователь с таким email уже зарегистрирован' });
      }
      if (existing.login === login) {
        return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
      }
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Создание пользователя (с ролью по умолчанию)
    const newUser = await pool.query(
      `INSERT INTO users (login, email, surname, name, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, login, email, surname, name, role, created_at`,
      [login, email, surname, name, passwordHash, 'user']
    );

    const user = newUser.rows[0];

    // Генерация токенов
    const { accessToken, refreshToken } = generateTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    // Отправляем данные пользователя (без пароля)
    res.status(201).json({
      message: 'Регистрация успешна',
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

// Авторизация пользователя
app.post('/login', authLimiter, async (req, res) => {
  try {
    const { login, password } = req.body;
    
    if (!login || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }

    // Поиск пользователя
    const userResult = await pool.query(
      'SELECT id, login, email, name, surname, password_hash, role FROM users WHERE login = $1',
      [login]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const user = userResult.rows[0];

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    // Генерация токенов
    const { accessToken, refreshToken } = generateTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    // Успешная авторизация
    res.json({
      message: 'Авторизация успешна',
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ошибка сервера при авторизации' });
  }
});

// Обновление access token с помощью refresh token
app.post('/api/refresh', authenticateRefreshToken, async (req, res) => {
  try {
    // Проверяем, что пользователь ещё существует и активен
    const userResult = await pool.query(
      'SELECT id, login, role FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    const user = userResult.rows[0];

    // Генерируем новую пару токенов
    const { accessToken, refreshToken } = generateTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      message: 'Токены обновлены',
      user: {
        id: user.id,
        login: user.login,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Refresh error:', err);
    clearAuthCookies(res);
    res.status(500).json({ error: 'Ошибка при обновлении токенов' });
  }
});

// Проверка авторизации
app.get('/check-auth', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, login, email, name, surname, role FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      clearAuthCookies(res);
      return res.json({ isAuthenticated: false, user: null });
    }

    res.json({
      isAuthenticated: true,
      user: userResult.rows[0]
    });

  } catch (err) {
    console.error('Check-auth error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Выход из системы
app.post('/logout', (req, res) => {
  clearAuthCookies(res);
  res.json({ message: 'Выход выполнен успешно' });
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

// ============================================
// 🔧 Получение всех доступных переключателей
// ============================================
app.get('/api/switches', authenticateToken, async (req, res) => {
  try {
    // Опционально: только админы могут получать полный список
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Доступ запрещён' });
    // }

    const switches = await pool.query(`
      SELECT 
        id,
        name,
        type,
        actuation_force,
        bottom_force,
        tactile_force,
        travel_length,
        price_per_switch,
        -- Формируем читаемое название для отображения
        CONCAT(name, ' (', type, ', ', 
               CASE 
                 WHEN actuation_force IS NOT NULL THEN actuation_force || 'г' 
                 ELSE '?' 
               END,
               ')') as display_name
      FROM switches 
      ORDER BY type, name
    `);

    res.json({
      success: true,
      data: switches.rows
    });

  } catch (err) {
    console.error('Error fetching switches:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка при загрузке переключателей' 
    });
  }
});

// ============================================
// ⌨️ Создание нового товара (клавиатуры) - ТОЛЬКО АДМИН
// ============================================
app.post('/api/products', 
  authenticateToken, 
  requireRole('admin'), 
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      const {
        name,
        description,
        base_price,
        switch_count,
        base_switch_id,        // ID свитча по умолчанию
        available_switch_ids,  // Массив ID доступных свитчей для этого товара
        specifications,        // Массив: [{ key, value, depends_on_switch }]
        equipment,             // Массив строк: ['Кабель USB-C', ...]
        image_urls             // Массив: [{ url, alt_text, sort_order }]
      } = req.body;

      // 🔹 Валидация обязательных полей
      if (!name || !base_price) {
        return res.status(400).json({ error: 'Название и базовая цена обязательны' });
      }
      if (!base_switch_id) {
        return res.status(400).json({ error: 'Необходимо выбрать переключатель по умолчанию' });
      }

      // 🔹 Начинаем транзакцию (все или ничего)
      await client.query('BEGIN');

      // 1️⃣ Создаём товар
      const productResult = await client.query(`
        INSERT INTO products_demo (
          name, 
          description, 
          base_price, 
          switch_count, 
          base_switch_id
        ) VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, name, base_price, switch_count, base_switch_id
      `, [
        name,
        description || null,
        parseFloat(base_price),
        parseInt(switch_count) || 60,
        parseInt(base_switch_id)
      ]);

      const newProduct = productResult.rows[0];
      const productId = newProduct.id;

      // 2️⃣ Добавляем доступные свитчи для этого товара
      if (Array.isArray(available_switch_ids) && available_switch_ids.length > 0) {
        for (let i = 0; i < available_switch_ids.length; i++) {
          await client.query(`
            INSERT INTO product_available_switches (
              product_id, 
              switch_id, 
              display_order
            ) VALUES ($1, $2, $3)
          `, [productId, parseInt(available_switch_ids[i]), i + 1]);
        }
      } else {
        // Если не указаны — добавляем хотя бы базовый свитч
        await client.query(`
          INSERT INTO product_available_switches (product_id, switch_id, display_order)
          VALUES ($1, $2, 1)
        `, [productId, parseInt(base_switch_id)]);
      }

      // 3️⃣ Добавляем характеристики (опционально)
      if (Array.isArray(specifications) && specifications.length > 0) {
        for (const spec of specifications) {
          await client.query(`
            INSERT INTO product_specifications (
              product_id, 
              spec_key, 
              spec_value, 
              depends_on_switch, 
              display_order
            ) VALUES ($1, $2, $3, $4, $5)
          `, [
            productId,
            spec.key,
            spec.value,
            spec.depends_on_switch || false,
            spec.display_order || 0
          ]);
        }
      }

      // 4️⃣ Добавляем комплектацию (опционально)
      if (Array.isArray(equipment) && equipment.length > 0) {
        for (let i = 0; i < equipment.length; i++) {
          await client.query(`
            INSERT INTO product_equipment (product_id, item_name, display_order)
            VALUES ($1, $2, $3)
          `, [productId, equipment[i], i + 1]);
        }
      }

      // 5️⃣ Добавляем изображения (опционально)
      if (Array.isArray(image_urls) && image_urls.length > 0) {
        for (const img of image_urls) {
          // Сначала добавляем в таблицу images
          const imageResult = await client.query(`
            INSERT INTO images (image_url, alt_text) 
            VALUES ($1, $2) 
            RETURNING id
          `, [img.url, img.alt_text || '']);
          
          const imageId = imageResult.rows[0].id;
          
          // Затем связываем с товаром
          await client.query(`
            INSERT INTO product_images (product_id, image_id, sort_order)
            VALUES ($1, $2, $3)
          `, [productId, imageId, img.sort_order || 0]);
        }
      }

      // 🔹 Фиксируем транзакцию
      await client.query('COMMIT');

      // 🔹 Возвращаем созданный товар с ссылками
      res.status(201).json({
        success: true,
        message: 'Клавиатура успешно добавлена',
        product: {
          ...newProduct,
          link: `/product.html?id=${newProduct.id}`
        }
      });

    } catch (err) {
      // 🔹 Откатываем транзакцию при ошибке
      await client.query('ROLLBACK');
      
      console.error('Create product error:', err);
      
      // Более подробная ошибка для админа (в продакшене — скрыть детали)
      res.status(500).json({ 
        success: false, 
        error: 'Ошибка при создании товара',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
      
    } finally {
      client.release();
    }
  }
);


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