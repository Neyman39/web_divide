// middleware/auth.js
const jwt = require('jsonwebtoken');

// Проверка access token
function authenticateToken(req, res, next) {
  // Пробуем взять токен из cookie или заголовка
  const token = req.cookies?.accessToken || 
                req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Требуется авторизация',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, login, role }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Сессия истекла', 
        code: 'TOKEN_EXPIRED' 
      });
    }
    return res.status(403).json({ 
      error: 'Неверный токен', 
      code: 'INVALID_TOKEN' 
    });
  }
}

// Проверка refresh token
function authenticateRefreshToken(req, res, next) {
  const token = req.cookies?.refreshToken;
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Требуется refresh token',
      code: 'NO_REFRESH_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ 
      error: 'Неверный refresh token', 
      code: 'INVALID_REFRESH_TOKEN' 
    });
  }
}

// Проверка роли
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Доступ запрещён: недостаточно прав',
        required: allowedRoles,
        current: req.user.role
      });
    }
    next();
  };
}

module.exports = { 
  authenticateToken, 
  authenticateRefreshToken, 
  requireRole 
};