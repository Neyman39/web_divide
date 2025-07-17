const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

// Настройки подключения к PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'my_shop',
  password: '1234',
  port: 5432,
});

app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Главная.html'));
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Роут для получения всех товаров
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products');
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

    // Здесь должна быть проверка JWT токена (если используете)
    // Для простоты будем проверять наличие пользователя в БД
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

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:5000`));