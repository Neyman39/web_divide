const jwt = require('jsonwebtoken');
require('dotenv').config();

function formatPriceRub(kopecks) {
  const rubles = Number(kopecks) / 100;
  return `${Math.round(rubles).toLocaleString('ru-RU')} ₽`;
}

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

module.exports = { generateTokens, setAuthCookies, clearAuthCookies, formatPriceRub };