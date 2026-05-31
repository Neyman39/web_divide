const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user_service');

const router = express.Router();

router.delete('/users/email/:email', asyncHandler(async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({ error: 'Email обязателен' });
  }

  const deletedUser = await userService.deleteByEmail(email);
  res.json({
    message: 'Пользователь успешно удален',
    deletedUser,
  });
}));

module.exports = router;
