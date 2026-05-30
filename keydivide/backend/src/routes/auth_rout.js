const express = require('express');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { generateTokens, setAuthCookies, clearAuthCookies } = require('../utils/authHelpers');
const pool = require('../config/db');
const { authenticateToken, authenticateRefreshToken } = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 0.5 * 60 * 1000, // потом исправить 0.5 на 15 чтобы было 15мин
  max: 5, // максимум 5 попыток на один IP
  message: { error: 'Слишком много попыток, попробуйте позже' },
  standardHeaders: true,
  legacyHeaders: false,
});


// Регистрация пользователя
router.post('/api/register', authLimiter, async (req, res) => {
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
router.post('/login', authLimiter, async (req, res) => {
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
router.post('/api/refresh', authenticateRefreshToken, async (req, res) => {
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
router.get('/check-auth', authenticateToken, async (req, res) => {
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
router.post('/logout', (req, res) => {
  clearAuthCookies(res);
  res.json({ message: 'Выход выполнен успешно' });
});

module.exports = router;
