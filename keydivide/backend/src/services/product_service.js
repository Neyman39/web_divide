const pool = require('../config/db');
const productRepository = require('../repository/product_repos');
const AppError = require('../utils/AppError');

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

  async createProduct(data) {
    const {
      name,
      description,
      base_price,
      switch_count,
      base_switch_id,
      available_switch_ids,
      specifications,
      equipment,
      image_urls,
    } = data;

    if (!name || !base_price) {
      throw new AppError('Название и базовая цена обязательны');
    }
    if (!base_switch_id) {
      throw new AppError('Необходимо выбрать переключатель по умолчанию');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const newProduct = await productRepository.insertProduct(client, {
        name,
        description,
        basePrice: parseFloat(base_price),
        switchCount: parseInt(switch_count, 10) || 60,
        baseSwitchId: parseInt(base_switch_id, 10),
      });

      const productId = newProduct.id;

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
          await productRepository.insertSpecification(client, productId, spec);
        }
      }

      if (Array.isArray(equipment)) {
        for (let i = 0; i < equipment.length; i++) {
          await productRepository.insertEquipment(client, productId, equipment[i], i + 1);
        }
      }

      if (Array.isArray(image_urls)) {
        for (const img of image_urls) {
          const imageId = await productRepository.insertImage(client, img.url, img.alt_text);
          await productRepository.linkProductImage(client, productId, imageId, img.sort_order);
        }
      }

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
}

module.exports = new ProductService();
