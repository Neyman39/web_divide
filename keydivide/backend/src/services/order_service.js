const defaultPool = require('../config/db');
const defaultCartRepository = require('../repository/cart_repos');
const defaultProductRepository = require('../repository/product_repos');
const defaultOrderRepository = require('../repository/order_repos');
const { sendOrderConfirmation: defaultSendOrderConfirmation } = require('./emailService');
const AppError = require('../utils/AppError');
const { toKopecks } = require('../utils/price');

class OrderService {
  constructor(deps = {}) {
    this.pool = deps.pool ?? defaultPool;
    this.cartRepository = deps.cartRepository ?? defaultCartRepository;
    this.productRepository = deps.productRepository ?? defaultProductRepository;
    this.orderRepository = deps.orderRepository ?? defaultOrderRepository;
    this.sendOrderConfirmation = deps.sendOrderConfirmation ?? defaultSendOrderConfirmation;
  }
  async createOrder(userId, emailPayload) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const cartItems = await this.cartRepository.findCartItemsForOrder(client, userId);
      if (cartItems.length === 0) {
        throw new AppError('Корзина пуста');
      }

      for (const item of cartItems) {
        const productStock = await this.productRepository.lockProductStock(client, item.product_id);
        if (item.quantity > productStock) {
          throw new AppError(
            `Недостаточно товара "${item.product_name}". Доступно: ${productStock}`
          );
        }

        if (item.switch_id) {
          const switchStock = await this.productRepository.lockSwitchStock(client, item.switch_id);
          if (item.quantity > switchStock) {
            throw new AppError(
              `Недостаточно свитчей "${item.switch_name}". Доступно: ${switchStock}`
            );
          }
        }
      }

      const total = cartItems.reduce(
        (sum, item) => sum + toKopecks(item.unit_price) * toKopecks(item.quantity),
        0
      );

      const order = await this.orderRepository.createOrder(client, userId, toKopecks(total));

      for (const item of cartItems) {
        await this.orderRepository.insertOrderItem(client, {
          orderId: order.id,
          productId: item.product_id,
          switchId: item.switch_id,
          quantity: item.quantity,
          unitPrice: toKopecks(item.unit_price),
        });

        await this.productRepository.decreaseProductStock(client, item.quantity, item.product_id);

        if (item.switch_id) {
          await this.productRepository.decreaseSwitchStock(client, item.quantity, item.switch_id);
        }
      }

      await this.cartRepository.clearByUserId(client, userId);
      await client.query('COMMIT');

      const items = await this.orderRepository.findOrderItemsForEmail(client, order.id);

      this.sendOrderConfirmation({
        user: {
          email: emailPayload.userEmail,
          name: emailPayload.userName || 'Покупатель',
          login: emailPayload.userLogin,
        },
        order,
        items,
        shopInfo: {
          name: 'MyShop',
          address: 'ул. Примерная, 1, Москва',
        },
      }).catch((err) => {
        console.error('❌ Failed to send order confirmation email:', err.message);
      });

      return { order, items };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getOrdersByUserId(userId) {
    const orders = await this.orderRepository.findByUserId(userId);
    const result = [];

    for (const order of orders) {
      const items = await this.orderRepository.findItemsByOrderId(order.id);
      result.push({
        id: order.id,
        total: order.total,
        status: order.status,
        created_at: order.created_at,
        items,
      });
    }

    return result;
  }
}

module.exports = new OrderService();
module.exports.OrderService = OrderService;
