const defaultCartRepository = require('../repository/cart_repos');
const defaultProductRepository = require('../repository/product_repos');
const AppError = require('../utils/AppError');
const { toKopecks } = require('../utils/price');

class CartService {
  constructor(deps = {}) {
    this.cartRepository = deps.cartRepository ?? defaultCartRepository;
    this.productRepository = deps.productRepository ?? defaultProductRepository;
  }
  async getCart(userId) {
    return this.cartRepository.findByUserId(userId);
  }

  async addToCart({ userId, productId, switchId, quantity }) {
    const product = await this.productRepository.findProductForCart(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const inCart = await this.cartRepository.sumQuantityByUserAndProduct(userId, productId);
    if (inCart + quantity > product.stock) {
      throw new AppError(`Недостаточно товара. Доступно: ${product.stock - inCart}`);
    }

    let switchPrice = 0;
    const usedSwitchId = switchId || product.base_switch_id;

    if (usedSwitchId) {
      const sw = await this.productRepository.findSwitchById(usedSwitchId);
      if (!sw) {
        throw new AppError('Switch not found', 404);
      }
      if (sw.stock < quantity) {
        throw new AppError(`Недостаточно свитчей "${sw.name}". Доступно: ${sw.stock}`);
      }
      switchPrice = sw.price_per_switch;
    }

    const unitPrice = toKopecks(
      Number(product.base_price) + Number(switchPrice) * Number(product.switch_count)
    );

    return this.cartRepository.insert({
      userId,
      productId,
      switchId: usedSwitchId,
      quantity,
      unitPrice,
    });
  }

  async updateCartItem(cartItemId, quantity) {
    if (quantity === 0) {
      const removed = await this.cartRepository.deleteById(cartItemId);
      if (!removed) {
        throw new AppError('Cart item not found', 404);
      }
      return { removed: true, item: removed };
    }

    const item = await this.cartRepository.findById(cartItemId);
    if (!item) {
      throw new AppError('Cart item not found', 404);
    }

    const productStock = await this.productRepository.findProductStock(item.product_id);
    if (productStock == null) {
      throw new AppError('Product not found', 404);
    }

    const otherInCart = await this.cartRepository.sumOtherQuantity(
      item.user_id,
      item.product_id,
      cartItemId
    );
    if (otherInCart + quantity > productStock) {
      throw new AppError(`Недостаточно товара. Доступно: ${productStock - otherInCart}`);
    }

    if (item.switch_id) {
      const sw = await this.productRepository.findSwitchStockAndName(item.switch_id);
      if (!sw) {
        throw new AppError('Switch not found', 404);
      }
      if (sw.stock < quantity) {
        throw new AppError(`Недостаточно свитчей "${sw.name}". Доступно: ${sw.stock}`);
      }
    }

    const updated = await this.cartRepository.updateQuantity(cartItemId, quantity);
    return { removed: false, item: updated };
  }

  async removeCartItem(cartItemId) {
    const removed = await this.cartRepository.deleteById(cartItemId);
    if (!removed) {
      throw new AppError('Cart item not found', 404);
    }
    return removed;
  }
}

module.exports = new CartService();
module.exports.CartService = CartService;
