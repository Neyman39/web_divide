const { describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');
const AppError = require('../src/utils/AppError');
const { OrderService } = require('../src/services/order_service');

function createMockClient() {
  const queries = [];
  return {
    queries,
    query: mock.fn(async (sql, params) => {
      queries.push({ sql, params });
      return { rows: [] };
    }),
    release: mock.fn(),
  };
}

function createOrderService(overrides = {}) {
  const client = overrides.client ?? createMockClient();

  const cartRepository = {
    findCartItemsForOrder: mock.fn(async () => []),
    clearByUserId: mock.fn(async () => {}),
    ...overrides.cartRepository,
  };

  const productRepository = {
    lockProductStock: mock.fn(async () => 0),
    lockSwitchStock: mock.fn(async () => 0),
    decreaseProductStock: mock.fn(async () => {}),
    decreaseSwitchStock: mock.fn(async () => {}),
    ...overrides.productRepository,
  };

  const orderRepository = {
    createOrder: mock.fn(async () => ({
      id: 100,
      total: 0,
      status: 'pending',
      created_at: '2026-05-30T00:00:00.000Z',
    })),
    insertOrderItem: mock.fn(async () => {}),
    findOrderItemsForEmail: mock.fn(async () => []),
    findByUserId: mock.fn(async () => []),
    findItemsByOrderId: mock.fn(async () => []),
    ...overrides.orderRepository,
  };

  const sendOrderConfirmation = mock.fn(async () => {});

  const pool = {
    connect: mock.fn(async () => client),
  };

  const service = new OrderService({
    pool,
    cartRepository,
    productRepository,
    orderRepository,
    sendOrderConfirmation,
  });

  return {
    service,
    client,
    pool,
    cartRepository,
    productRepository,
    orderRepository,
    sendOrderConfirmation,
  };
}

async function assertAppError(promise, { message, statusCode = 400 }) {
  await assert.rejects(promise, (err) => {
    assert.ok(err instanceof AppError);
    assert.equal(err.message, message);
    assert.equal(err.statusCode, statusCode);
    return true;
  });
}

describe('OrderService.createOrder', () => {
  it('throws when cart is empty', async () => {
    const { service, client } = createOrderService();

    await assertAppError(service.createOrder(1, {}), { message: 'Корзина пуста' });
    assert.equal(client.query.mock.calls.some((call) => call.arguments[0] === 'ROLLBACK'), true);
    assert.equal(client.release.mock.calls.length, 1);
  });

  it('throws and rolls back when product stock is insufficient', async () => {
    const { service, client, cartRepository } = createOrderService({
      cartRepository: {
        findCartItemsForOrder: mock.fn(async () => [{
          product_id: 1,
          product_name: 'Keyboard X',
          switch_id: null,
          quantity: 5,
          unit_price: 10000,
        }]),
      },
      productRepository: {
        lockProductStock: mock.fn(async () => 2),
      },
    });

    await assertAppError(
      service.createOrder(1, {}),
      { message: 'Недостаточно товара "Keyboard X". Доступно: 2' }
    );

    assert.equal(cartRepository.findCartItemsForOrder.mock.calls.length, 1);
    assert.equal(client.query.mock.calls.some((call) => call.arguments[0] === 'ROLLBACK'), true);
  });

  it('throws when switch stock is insufficient', async () => {
    const { service, client } = createOrderService({
      cartRepository: {
        findCartItemsForOrder: mock.fn(async () => [{
          product_id: 1,
          product_name: 'Keyboard X',
          switch_id: 9,
          switch_name: 'Red Switch',
          quantity: 4,
          unit_price: 10000,
        }]),
      },
      productRepository: {
        lockProductStock: mock.fn(async () => 10),
        lockSwitchStock: mock.fn(async () => 1),
      },
    });

    await assertAppError(
      service.createOrder(1, {}),
      { message: 'Недостаточно свитчей "Red Switch". Доступно: 1' }
    );

    assert.equal(client.query.mock.calls.some((call) => call.arguments[0] === 'ROLLBACK'), true);
  });

  it('creates order, decreases stock, clears cart and sends email', async () => {
    const cartItems = [
      {
        product_id: 1,
        product_name: 'Keyboard X',
        switch_id: 9,
        switch_name: 'Red Switch',
        quantity: 2,
        unit_price: '15000.00',
      },
      {
        product_id: 2,
        product_name: 'Keyboard Y',
        switch_id: null,
        quantity: 1,
        unit_price: 8000,
      },
    ];

    const emailItems = [{ product_name: 'Keyboard X', quantity: 2 }];
    const order = {
      id: 55,
      total: 38000,
      status: 'pending',
      created_at: '2026-05-30T12:00:00.000Z',
    };

    const {
      service,
      client,
      cartRepository,
      productRepository,
      orderRepository,
      sendOrderConfirmation,
    } = createOrderService({
      cartRepository: {
        findCartItemsForOrder: mock.fn(async () => cartItems),
      },
      productRepository: {
        lockProductStock: mock.fn(async () => 10),
        lockSwitchStock: mock.fn(async () => 10),
      },
      orderRepository: {
        createOrder: mock.fn(async (_client, userId, total) => ({ ...order, total })),
        findOrderItemsForEmail: mock.fn(async () => emailItems),
      },
    });

    const result = await service.createOrder(7, {
      userEmail: 'buyer@test.com',
      userName: 'Buyer',
      userLogin: 'buyer',
    });

    assert.deepEqual(result.order.total, 38000);
    assert.deepEqual(result.items, emailItems);

    assert.equal(orderRepository.createOrder.mock.calls[0].arguments[1], 7);
    assert.equal(orderRepository.createOrder.mock.calls[0].arguments[2], 38000);

    assert.equal(orderRepository.insertOrderItem.mock.calls.length, 2);
    assert.equal(productRepository.decreaseProductStock.mock.calls.length, 2);
    assert.equal(productRepository.decreaseSwitchStock.mock.calls.length, 1);
    assert.equal(cartRepository.clearByUserId.mock.calls.length, 1);
    assert.deepEqual(cartRepository.clearByUserId.mock.calls[0].arguments, [client, 7]);

    assert.equal(client.query.mock.calls.some((call) => call.arguments[0] === 'BEGIN'), true);
    assert.equal(client.query.mock.calls.some((call) => call.arguments[0] === 'COMMIT'), true);
    assert.equal(client.release.mock.calls.length, 1);

    assert.equal(sendOrderConfirmation.mock.calls.length, 1);
    assert.deepEqual(sendOrderConfirmation.mock.calls[0].arguments[0].user, {
      email: 'buyer@test.com',
      name: 'Buyer',
      login: 'buyer',
    });
  });
});

describe('OrderService.getOrdersByUserId', () => {
  it('loads items for each order', async () => {
    const { service, orderRepository } = createOrderService({
      orderRepository: {
        findByUserId: mock.fn(async () => [
          { id: 1, total: 1000, status: 'pending', created_at: '2026-05-30' },
          { id: 2, total: 2000, status: 'done', created_at: '2026-05-29' },
        ]),
        findItemsByOrderId: mock.fn(async (orderId) => [{ orderId, product_name: `P${orderId}` }]),
      },
    });

    const orders = await service.getOrdersByUserId(3);

    assert.equal(orders.length, 2);
    assert.deepEqual(orders[0].items, [{ orderId: 1, product_name: 'P1' }]);
    assert.deepEqual(orders[1].items, [{ orderId: 2, product_name: 'P2' }]);
    assert.equal(orderRepository.findItemsByOrderId.mock.calls.length, 2);
  });
});
