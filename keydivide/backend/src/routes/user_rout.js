const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Удаление пользователя по email
router.delete('/users/email/:email', async (req, res) => {
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

module.exports = router;