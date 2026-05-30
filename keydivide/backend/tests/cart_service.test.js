const { describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');
const AppError = require('../src/utils/AppError');
const { CartService } = require('../src/services/cart_service');

function createCartService(overrides = {}) {
  const cartRepository = {
    findByUserId: mock.fn(async () => []),
    sumQuantityByUserAndProduct: mock.fn(async () => 0),
    sumOtherQuantity: mock.fn(async () => 0),
    findById: mock.fn(async () => null),
    insert: mock.fn(async (data) => ({ id: 1, ...data })),
    updateQuantity: mock.fn(async (_id, quantity) => ({ id: 1, quantity })),
    deleteById: mock.fn(async () => null),
    ...overrides.cartRepository,
  };

  const productRepository = {
    findProductForCart: mock.fn(async () => null),
    findProductStock: mock.fn(async () => null),
    findSwitchById: mock.fn(async () => null),
    findSwitchStockAndName: mock.fn(async () => null),
    ...overrides.productRepository,
  };

  return {
    service: new CartService({ cartRepository, productRepository }),
    cartRepository,
    productRepository,
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

describe('CartService.addToCart', () => {
  const baseProduct = {
    stock: 10,
    base_price: '50000.00',
    base_switch_id: 3,
    switch_count: 60,
  };

  it('throws 404 when product is missing', async () => {
    const { service } = createCartService();
    await assertAppError(
      service.addToCart({ userId: 1, productId: 99, quantity: 1 }),
      { message: 'Product not found', statusCode: 404 }
    );
  });

  it('rejects when requested quantity exceeds available stock including cart', async () => {
    const { service, cartRepository, productRepository } = createCartService({
      productRepository: {
        findProductForCart: mock.fn(async () => baseProduct),
      },
      cartRepository: {
        sumQuantityByUserAndProduct: mock.fn(async () => 8),
      },
    });

    await assertAppError(
      service.addToCart({ userId: 1, productId: 1, quantity: 3 }),
      { message: 'Недостаточно товара. Доступно: 2' }
    );

    assert.equal(cartRepository.sumQuantityByUserAndProduct.mock.calls.length, 1);
    assert.equal(productRepository.findProductForCart.mock.calls.length, 1);
  });

  it('throws 404 when switch is missing', async () => {
    const { service, productRepository } = createCartService({
      productRepository: {
        findProductForCart: mock.fn(async () => baseProduct),
        findSwitchById: mock.fn(async () => null),
      },
    });

    await assertAppError(
      service.addToCart({ userId: 1, productId: 1, switchId: 5, quantity: 1 }),
      { message: 'Switch not found', statusCode: 404 }
    );

    assert.deepEqual(productRepository.findSwitchById.mock.calls[0].arguments, [5]);
  });

  it('rejects when switch stock is insufficient', async () => {
    const { service } = createCartService({
      productRepository: {
        findProductForCart: mock.fn(async () => baseProduct),
        findSwitchById: mock.fn(async () => ({
          name: 'Red Switch',
          stock: 2,
          price_per_switch: 150,
        })),
      },
    });

    await assertAppError(
      service.addToCart({ userId: 1, productId: 1, switchId: 5, quantity: 3 }),
      { message: 'Недостаточно свитчей "Red Switch". Доступно: 2' }
    );
  });

  it('calculates unit price and inserts cart item with explicit switch', async () => {
    const inserted = { id: 42, user_id: 1, quantity: 2 };
    const { service, cartRepository } = createCartService({
      productRepository: {
        findProductForCart: mock.fn(async () => baseProduct),
        findSwitchById: mock.fn(async () => ({
          name: 'Red Switch',
          stock: 10,
          price_per_switch: 150,
        })),
      },
      cartRepository: {
        insert: mock.fn(async () => inserted),
      },
    });

    const result = await service.addToCart({
      userId: 1,
      productId: 1,
      switchId: 5,
      quantity: 2,
    });

    assert.deepEqual(result, inserted);
    assert.deepEqual(cartRepository.insert.mock.calls[0].arguments, [{
      userId: 1,
      productId: 1,
      switchId: 5,
      quantity: 2,
      unitPrice: 59000,
    }]);
  });

  it('uses base_switch_id when switchId is not provided', async () => {
    const { service, cartRepository, productRepository } = createCartService({
      productRepository: {
        findProductForCart: mock.fn(async () => ({ ...baseProduct, base_switch_id: 7 })),
        findSwitchById: mock.fn(async () => ({
          name: 'Default Switch',
          stock: 10,
          price_per_switch: 100,
        })),
      },
      cartRepository: {
        insert: mock.fn(async (data) => data),
      },
    });

    await service.addToCart({ userId: 1, productId: 1, quantity: 1 });

    assert.deepEqual(productRepository.findSwitchById.mock.calls[0].arguments, [7]);
    assert.equal(cartRepository.insert.mock.calls[0].arguments[0].switchId, 7);
  });
});

describe('CartService.updateCartItem', () => {
  const cartItem = {
    id: 10,
    user_id: 1,
    product_id: 2,
    switch_id: 4,
    quantity: 1,
  };

  it('removes item when quantity is 0', async () => {
    const removed = { ...cartItem, quantity: 0 };
    const { service } = createCartService({
      cartRepository: {
        deleteById: mock.fn(async () => removed),
      },
    });

    const result = await service.updateCartItem(10, 0);
    assert.deepEqual(result, { removed: true, item: removed });
  });

  it('throws 404 when removing non-existent item', async () => {
    const { service } = createCartService();
    await assertAppError(service.updateCartItem(999, 0), {
      message: 'Cart item not found',
      statusCode: 404,
    });
  });

  it('rejects update when total quantity in cart exceeds product stock', async () => {
    const { service } = createCartService({
      cartRepository: {
        findById: mock.fn(async () => cartItem),
        sumOtherQuantity: mock.fn(async () => 3),
      },
      productRepository: {
        findProductStock: mock.fn(async () => 5),
      },
    });

    await assertAppError(service.updateCartItem(10, 3), {
      message: 'Недостаточно товара. Доступно: 2',
    });
  });

  it('rejects update when switch stock is insufficient', async () => {
    const { service } = createCartService({
      cartRepository: {
        findById: mock.fn(async () => cartItem),
        sumOtherQuantity: mock.fn(async () => 0),
      },
      productRepository: {
        findProductStock: mock.fn(async () => 10),
        findSwitchStockAndName: mock.fn(async () => ({
          name: 'Blue Switch',
          stock: 1,
        })),
      },
    });

    await assertAppError(service.updateCartItem(10, 2), {
      message: 'Недостаточно свитчей "Blue Switch". Доступно: 1',
    });
  });

  it('updates quantity when stock checks pass', async () => {
    const updated = { ...cartItem, quantity: 4 };
    const { service, cartRepository } = createCartService({
      cartRepository: {
        findById: mock.fn(async () => cartItem),
        sumOtherQuantity: mock.fn(async () => 1),
        updateQuantity: mock.fn(async () => updated),
      },
      productRepository: {
        findProductStock: mock.fn(async () => 10),
        findSwitchStockAndName: mock.fn(async () => ({
          name: 'Blue Switch',
          stock: 10,
        })),
      },
    });

    const result = await service.updateCartItem(10, 4);
    assert.deepEqual(result, { removed: false, item: updated });
    assert.deepEqual(cartRepository.updateQuantity.mock.calls[0].arguments, [10, 4]);
  });
});

describe('CartService.removeCartItem', () => {
  it('throws 404 when item does not exist', async () => {
    const { service } = createCartService();
    await assertAppError(service.removeCartItem(1), {
      message: 'Cart item not found',
      statusCode: 404,
    });
  });

  it('returns removed item', async () => {
    const removed = { id: 5, quantity: 1 };
    const { service } = createCartService({
      cartRepository: {
        deleteById: mock.fn(async () => removed),
      },
    });

    const result = await service.removeCartItem(5);
    assert.deepEqual(result, removed);
  });
});
