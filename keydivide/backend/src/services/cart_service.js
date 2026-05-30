const cartRepository = require('../repositories/cart.repository');

class CartService {
  async getCart(userId) {
    // Валидация входных данных (бизнес-правило)
    if (!userId) {
      throw new Error('userId is required');
    }

    // Делегируем работу с БД репозиторию
    const items = await cartRepository.findByUserId(userId);
    return items;
  }
}

module.exports = new CartService();