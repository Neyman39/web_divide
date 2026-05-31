const pool = require('../config/db');
const productRepository = require('../repository/product_repos');
const AppError = require('../utils/AppError');
const { syncSequence } = require('../utils/syncSequence');

class ProductService {
  async getAllProducts() {
    return productRepository.findAll();
  }

  async getProductById(productId) {
    const client = await pool.connect();
    try {
      const product = await productRepository.findBasicById(client, productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      const [images, specifications, equipment] = await Promise.all([
        productRepository.findImagesByProductId(client, productId),
        productRepository.findSpecificationsByProductId(client, productId),
        productRepository.findEquipmentByProductId(client, productId),
      ]);

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        base_price: parseFloat(product.base_price),
        current_price: parseFloat(product.current_price),
        switch_count: product.switch_count,
        base_switch_id: product.base_switch_id,
        base_switch_name: product.base_switch_name,
        base_switch_type: product.base_switch_type,
        images: images.map((img) => ({
          url: img.image_url,
          alt: img.alt_text,
        })),
        specifications: specifications.map((spec) => ({
          key: spec.spec_key,
          value: spec.spec_value,
          depends_on_switch: spec.depends_on_switch,
        })),
        equipment: equipment.map((eq) => eq.item_name),
      };
    } finally {
      client.release();
    }
  }

  async getAdminProductById(productId) {
    const client = await pool.connect();
    try {
      const product = await productRepository.findAdminById(client, productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }
      return product;
    } finally {
      client.release();
    }
  }

  async getProductSwitches(productId) {
    const client = await pool.connect();
    try {
      const product = await productRepository.findProductPricingInfo(client, productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      const switches = await productRepository.findAvailableSwitches(
        client,
        productId,
        product.switch_count,
        product.base_price,
        product.base_switch_id
      );

      return {
        product_id: productId,
        base_price: parseFloat(product.base_price),
        switch_count: product.switch_count,
        available_switches: switches.map((sw) => ({
          id: sw.id,
          name: sw.name,
          type: sw.type,
          actuation_force: sw.actuation_force,
          bottom_force: sw.bottom_force,
          tactile_force: sw.tactile_force,
          travel_length: sw.travel_length,
          price_per_switch: parseFloat(sw.price_per_switch),
          image_url: sw.image_url,
          switch_count: parseInt(sw.switch_count, 10),
          additional_price: parseFloat(sw.additional_price),
          total_price: parseFloat(sw.total_price),
          is_default: sw.is_default,
        })),
      };
    } finally {
      client.release();
    }
  }

  async getAllSwitches() {
    return productRepository.findAllSwitches();
  }

  _validateProductPayload(data) {
    const { name, base_price, base_switch_id } = data;

    if (!name?.trim()) {
      throw new AppError('Название и базовая цена обязательны');
    }
    if (base_price == null || Number(base_price) < 0) {
      throw new AppError('Укажите корректную базовую цену');
    }
    if (!base_switch_id) {
      throw new AppError('Необходимо выбрать переключатель по умолчанию');
    }
  }

  async _saveProductRelations(client, productId, data) {
    const {
      base_switch_id,
      available_switch_ids,
      specifications,
      equipment,
      image_urls,
    } = data;

    if (Array.isArray(available_switch_ids) && available_switch_ids.length > 0) {
      for (let i = 0; i < available_switch_ids.length; i++) {
        await productRepository.insertAvailableSwitch(
          client,
          productId,
          parseInt(available_switch_ids[i], 10),
          i + 1
        );
      }
    } else {
      await productRepository.insertAvailableSwitch(
        client,
        productId,
        parseInt(base_switch_id, 10),
        1
      );
    }

    if (Array.isArray(specifications)) {
      for (const spec of specifications) {
        if (!spec.key?.trim()) continue;
        await productRepository.insertSpecification(client, productId, spec);
      }
    }

    if (Array.isArray(equipment)) {
      for (let i = 0; i < equipment.length; i++) {
        const item = typeof equipment[i] === 'string' ? equipment[i] : equipment[i]?.item;
        if (!item?.trim()) continue;
        await productRepository.insertEquipment(client, productId, item.trim(), i + 1);
      }
    }

    if (Array.isArray(image_urls)) {
      for (const img of image_urls) {
        if (!img.url?.trim()) continue;
        const imageId = await productRepository.insertImage(client, img.url, img.alt_text);
        await productRepository.linkProductImage(client, productId, imageId, img.sort_order);
      }
    }
  }

  async createProduct(data) {
    this._validateProductPayload(data);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const newProduct = await productRepository.insertProduct(client, {
        name: data.name.trim(),
        description: data.description,
        basePrice: parseFloat(data.base_price),
        switchCount: parseInt(data.switch_count, 10) || 60,
        baseSwitchId: parseInt(data.base_switch_id, 10),
        stock: parseInt(data.stock, 10) || 0,
      });

      await this._saveProductRelations(client, newProduct.id, data);

      await client.query('COMMIT');

      return {
        ...newProduct,
        link: `/product.html?id=${newProduct.id}`,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateProduct(productId, data) {
    this._validateProductPayload(data);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const updated = await productRepository.updateProductCore(client, productId, {
        name: data.name.trim(),
        description: data.description,
        basePrice: parseFloat(data.base_price),
        switchCount: parseInt(data.switch_count, 10) || 60,
        baseSwitchId: parseInt(data.base_switch_id, 10),
        stock: parseInt(data.stock, 10) || 0,
      });

      if (!updated) {
        throw new AppError('Product not found', 404);
      }

      await productRepository.deleteProductRelations(client, productId);
      await this._saveProductRelations(client, productId, data);

      await client.query('COMMIT');

      return {
        ...updated,
        link: `/product.html?id=${updated.id}`,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async deleteProduct(productId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const deleted = await productRepository.deleteProduct(client, productId);
      if (!deleted) {
        throw new AppError('Product not found', 404);
      }
      await syncSequence('products_demo', client);
      await client.query('COMMIT');
      return { id: productId };
    } catch (err) {
      await client.query('ROLLBACK');
      if (err.code === '23503') {
        throw new AppError(
          'Нельзя удалить клавиатуру: она используется в заказах или корзинах',
          409
        );
      }
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new ProductService();
