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
  password: 'admin',
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

// ================== КОРЗИНА ==================

// Получить корзину пользователя (по user_id, временно передаётся в query)
app.get('/api/cart', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    const query = `
      SELECT 
        ci.id,
        ci.product_id,
        ci.switch_id,
        ci.quantity,
        ci.unit_price,
        p.name AS product_name,
        s.name AS switch_name
      FROM cart_items ci
      JOIN products_demo p ON ci.product_id = p.id
      LEFT JOIN switches s ON ci.switch_id = s.id
      WHERE ci.user_id = $1
      ORDER BY ci.added_at
    `;
    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Добавить в корзину
app.post('/api/cart/add', async (req, res) => {
  const { userId, productId, switchId, quantity } = req.body;
  if (!userId || !productId || quantity == null || quantity < 1) {
    return res.status(400).json({ error: 'userId, productId и quantity > 0 обязательны' });
  }

  try {
    // Проверим наличие товара на складе
    const stockQuery = 'SELECT stock, base_price, base_switch_id, switch_count FROM products_demo WHERE id = $1';
    const stockResult = await pool.query(stockQuery, [productId]);
    if (stockResult.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    const product = stockResult.rows[0];
    const availableStock = product.stock;

    // Считаем, сколько уже зарезервировано пользователем в корзине этого товара
    const currentCartQuery = `
      SELECT COALESCE(SUM(quantity), 0) as in_cart
      FROM cart_items
      WHERE user_id = $1 AND product_id = $2
    `;
    const currentCartResult = await pool.query(currentCartQuery, [userId, productId]);
    const inCart = parseInt(currentCartResult.rows[0].in_cart);

    if (inCart + quantity > availableStock) {
      return res.status(400).json({ 
        error: `Недостаточно товара на складе. Доступно: ${availableStock - inCart}` 
      });
    }

    // Рассчитаем цену с учётом выбранного свитча
    let unitPrice = parseFloat(product.base_price);
    if (switchId) {
      const switchQuery = 'SELECT price_per_switch FROM switches WHERE id = $1';
      const switchResult = await pool.query(switchQuery, [switchId]);
      if (switchResult.rows.length === 0) return res.status(404).json({ error: 'Switch not found' });
      const pricePerSwitch = parseFloat(switchResult.rows[0].price_per_switch);
      // Цена = базовая цена + (цена_свитча * количество_свитчей)
      unitPrice = parseFloat(product.base_price) + (pricePerSwitch * parseFloat(product.switch_count));
    } else {
      // Если свитч не указан, используем базовый свитч продукта
      if (product.base_switch_id) {
        const defaultSwitchQuery = 'SELECT price_per_switch FROM switches WHERE id = $1';
        const defaultSwitchResult = await pool.query(defaultSwitchQuery, [product.base_switch_id]);
        if (defaultSwitchResult.rows.length > 0) {
          const pricePerSwitch = parseFloat(defaultSwitchResult.rows[0].price_per_switch);
          unitPrice = parseFloat(product.base_price) + (pricePerSwitch * parseFloat(product.switch_count));
        }
      }
    }

    // Добавим в корзину
    const insertQuery = `
      INSERT INTO cart_items (user_id, product_id, switch_id, quantity, unit_price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const { rows } = await pool.query(insertQuery, [
      userId, 
      productId, 
      switchId || null, 
      quantity, 
      unitPrice
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить количество товара в корзине
app.put('/api/cart/update/:id', async (req, res) => {
  const cartItemId = parseInt(req.params.id);
  const { quantity } = req.body;
  if (!quantity || quantity < 0) return res.status(400).json({ error: 'quantity >= 0 required' });

  try {
    if (quantity === 0) {
      // Удаляем позицию
      const deleteQuery = 'DELETE FROM cart_items WHERE id = $1 RETURNING *';
      const { rows } = await pool.query(deleteQuery, [cartItemId]);
      if (rows.length === 0) return res.status(404).json({ error: 'Cart item not found' });
      return res.json({ message: 'Item removed', item: rows[0] });
    }

    // Получаем текущий элемент корзины
    const cartItem = await pool.query('SELECT * FROM cart_items WHERE id = $1', [cartItemId]);
    if (cartItem.rows.length === 0) return res.status(404).json({ error: 'Cart item not found' });

    const item = cartItem.rows[0];
    
    // Проверяем остаток на складе
    const stockQuery = 'SELECT stock FROM products_demo WHERE id = $1';
    const stockResult = await pool.query(stockQuery, [item.product_id]);
    const availableStock = stockResult.rows[0].stock;

    // Сколько этого товара уже в корзине у пользователя, исключая текущий элемент
    const otherCartQuery = `
      SELECT COALESCE(SUM(quantity), 0) as in_cart
      FROM cart_items
      WHERE user_id = $1 AND product_id = $2 AND id != $3
    `;
    const otherCartResult = await pool.query(otherCartQuery, [item.user_id, item.product_id, cartItemId]);
    const otherInCart = parseInt(otherCartResult.rows[0].in_cart);

    if (otherInCart + quantity > availableStock) {
      return res.status(400).json({ 
        error: `Недостаточно товара. Доступно: ${availableStock - otherInCart}` 
      });
    }

    // Обновляем количество
    const updateQuery = 'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *';
    const { rows } = await pool.query(updateQuery, [quantity, cartItemId]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить позицию из корзины
app.delete('/api/cart/remove/:id', async (req, res) => {
  const cartItemId = parseInt(req.params.id);
  try {
    const { rows } = await pool.query('DELETE FROM cart_items WHERE id = $1 RETURNING *', [cartItemId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Cart item not found' });
    res.json({ message: 'Item removed', item: rows[0] });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ================== ОФОРМЛЕНИЕ ЗАКАЗА ==================

app.post('/api/orders', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId обязателен' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // начало транзакции

    // 1. Получаем корзину пользователя
    const cartQuery = `
      SELECT 
        ci.id AS cart_item_id,
        ci.product_id,
        ci.switch_id,
        ci.quantity,
        ci.unit_price,
        p.stock,
        p.name AS product_name
      FROM cart_items ci
      JOIN products_demo p ON ci.product_id = p.id
      WHERE ci.user_id = $1
      ORDER BY ci.id
    `;
    const cartResult = await client.query(cartQuery, [userId]);
    const cartItems = cartResult.rows;

    if (cartItems.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Корзина пуста' });
    }

    // 2. Проверяем, хватает ли остатков для каждой позиции
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Недостаточно товара "${item.product_name}". Доступно: ${item.stock}, запрошено: ${item.quantity}`
        });
      }
    }

    // 3. Вычисляем общую сумму заказа
    const total = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.unit_price) * item.quantity,
      0
    );

    // 4. Создаём заказ
    const orderQuery = `
      INSERT INTO orders (user_id, total, status)
      VALUES ($1, $2, 'pending')
      RETURNING id, total, status, created_at
    `;
    const orderResult = await client.query(orderQuery, [userId, total.toFixed(2)]);
    const order = orderResult.rows[0];

    // 5. Переносим позиции корзины → order_items и уменьшаем stock
    const orderItemsQuery = `
      INSERT INTO order_items (order_id, product_id, switch_id, quantity, unit_price)
      VALUES ($1, $2, $3, $4, $5)
    `;

    for (const item of cartItems) {
      // Добавляем в order_items
      await client.query(orderItemsQuery, [
        order.id,
        item.product_id,
        item.switch_id,
        item.quantity,
        item.unit_price
      ]);

      // Уменьшаем stock у продукта
      await client.query(
        'UPDATE products_demo SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // 6. Очищаем корзину пользователя
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    await client.query('COMMIT'); // завершаем транзакцию

    // 7. Возвращаем заказ с позициями
    const orderDetailsQuery = `
      SELECT 
        oi.id,
        oi.product_id,
        p.name AS product_name,
        s.name AS switch_name,
        oi.quantity,
        oi.unit_price,
        (oi.quantity * oi.unit_price) AS subtotal
      FROM order_items oi
      JOIN products_demo p ON oi.product_id = p.id
      LEFT JOIN switches s ON oi.switch_id = s.id
      WHERE oi.order_id = $1
      ORDER BY oi.id
    `;
    const itemsResult = await client.query(orderDetailsQuery, [order.id]);

    res.status(201).json({
      order: {
        id: order.id,
        user_id: userId,
        total: parseFloat(order.total),
        status: order.status,
        created_at: order.created_at
      },
      items: itemsResult.rows
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  } finally {
    client.release();
  }
});

// Получить заказы пользователя
app.get('/api/orders', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId обязателен' });

  try {
    // Все заказы пользователя с основной информацией
    const ordersQuery = `
      SELECT id, total, status, created_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const { rows: orders } = await pool.query(ordersQuery, [userId]);

    // Для каждого заказа подгружаем состав
    const result = [];
    for (const order of orders) {
      const itemsQuery = `
        SELECT oi.quantity, oi.unit_price,
               p.name AS product_name,
               s.name AS switch_name
        FROM order_items oi
        JOIN products_demo p ON oi.product_id = p.id
        LEFT JOIN switches s ON oi.switch_id = s.id
        WHERE oi.order_id = $1
      `;
      const { rows: items } = await pool.query(itemsQuery, [order.id]);
      result.push({
        id: order.id,
        total: parseFloat(order.total),
        status: order.status,
        created_at: order.created_at,
        items: items
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Ошибка получения заказов' });
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