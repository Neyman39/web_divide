const express = require('express');
const rateLimit = require('express-rate-limit');
const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth_service');
const { generateTokens, setAuthCookies, clearAuthCookies } = require('../utils/authHelpers');
const passport = require('../middleware/passport');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 0.5 * 60 * 1000,
  max: 5,
  message: { error: 'Слишком много попыток, попробуйте позже' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/api/register', authLimiter, asyncHandler(async (req, res) => {
  const { login, email, surname, name, password } = req.body;
  if (!login || !email || !surname || !name || !password) {
    return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
  }

  const user = await authService.register({ login, email, surname, name, password });
  const { accessToken, refreshToken } = generateTokens(user);
  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    message: 'Регистрация успешна',
    user: authService.formatPublicUser(user),
  });
}));

router.post(
  '/login',
  authLimiter,
  passport.authenticate('local', { session: false }),
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { accessToken, refreshToken } = generateTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      message: 'Авторизация успешна',
      user: authService.formatPublicUser(user),
    });
  })
);

router.post(
  '/api/refresh',
  passport.authenticate('jwt-refresh', { session: false }),
  asyncHandler(async (req, res) => {
    try {
      const user = await authService.refreshUser(req.user.id);
      const { accessToken, refreshToken } = generateTokens(user);
      setAuthCookies(res, accessToken, refreshToken);

      res.json({
        message: 'Токены обновлены',
        user: {
          id: user.id,
          login: user.login,
          role: user.role,
        },
      });
    } catch (err) {
      clearAuthCookies(res);
      throw err;
    }
  })
);

router.get(
  '/check-auth',
  passport.authenticate('jwt', { session: false }),
  asyncHandler(async (req, res) => {
    const user = await authService.checkAuth(req.user.id);
    if (!user) {
      clearAuthCookies(res);
      return res.json({ isAuthenticated: false, user: null });
    }

    res.json({
      isAuthenticated: true,
      user,
    });
  })
);

router.post('/logout', (req, res) => {
  clearAuthCookies(res);
  res.json({ message: 'Выход выполнен успешно' });
});

module.exports = router;
