const pool = require('../config/db');

class ProductRepository {
  async findAll() {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.base_price,
        p.switch_count,
        (p.base_price + (s.price_per_switch * p.switch_count)) as price,
        i.image_url as img,
        CONCAT('product.html?id=', p.id) as link
      FROM products_demo p
      LEFT JOIN switches s ON p.base_switch_id = s.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 1
      LEFT JOIN images i ON pi.image_id = i.id
      ORDER BY p.id
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async findBasicById(client, productId) {
    const query = `
      SELECT p.id, p.name, p.description, p.base_price,
          p.switch_count, p.base_switch_id,
          s.name as base_switch_name,
          s.type as base_switch_type,
          (p.base_price + (s.price_per_switch * p.switch_count)) as current_price
      FROM products_demo p
      LEFT JOIN switches s ON p.base_switch_id = s.id
      WHERE p.id = $1
    `;
    const { rows } = await client.query(query, [productId]);
    return rows[0] || null;
  }

  async findImagesByProductId(client, productId) {
    const query = `
      SELECT i.image_url, i.alt_text
      FROM product_images pi
      JOIN images i ON pi.image_id = i.id
      WHERE pi.product_id = $1
      ORDER BY pi.sort_order
    `;
    const { rows } = await client.query(query, [productId]);
    return rows;
  }

  async findSpecificationsByProductId(client, productId) {
    const query = `
      SELECT spec_key, spec_value, depends_on_switch, display_order
      FROM product_specifications
      WHERE product_id = $1
      ORDER BY display_order
    `;
    const { rows } = await client.query(query, [productId]);
    return rows;
  }

  async findEquipmentByProductId(client, productId) {
    const query = `
      SELECT item_name
      FROM product_equipment
      WHERE product_id = $1
      ORDER BY display_order
    `;
    const { rows } = await client.query(query, [productId]);
    return rows;
  }

  async findProductPricingInfo(client, productId) {
    const { rows } = await client.query(
      'SELECT base_price, switch_count, base_switch_id FROM products_demo WHERE id = $1',
      [productId]
    );
    return rows[0] || null;
  }

  async findAvailableSwitches(client, productId, switchCount, basePrice, baseSwitchId) {
    const query = `
      SELECT s.id, s.name, s.type, s.actuation_force, s.bottom_force,
          s.tactile_force, s.travel_length, s.price_per_switch,
          $1::decimal as switch_count,
          (s.price_per_switch * ($1::decimal)) as additional_price,
          ($2 + (s.price_per_switch * ($1::decimal))) as total_price,
          pas.display_order,
          (s.id = $3) as is_default
      FROM product_available_switches pas
      JOIN switches s ON pas.switch_id = s.id
      WHERE pas.product_id = $4
      ORDER BY pas.display_order
    `;
    const { rows } = await client.query(query, [switchCount, basePrice, baseSwitchId, productId]);
    return rows;
  }

  async findAllSwitches() {
    const { rows } = await pool.query(`
      SELECT id, name, type, actuation_force, bottom_force,
        tactile_force, travel_length, price_per_switch,
        CONCAT(name, ' (', type, ', ', 
               CASE 
                 WHEN actuation_force IS NOT NULL THEN actuation_force || 'г' 
                 ELSE '?' 
               END,
               ')') as display_name
      FROM switches 
      ORDER BY type, name
    `);
    return rows;
  }

  async findProductForCart(productId) {
    const { rows } = await pool.query(
      'SELECT stock, base_price, base_switch_id, switch_count FROM products_demo WHERE id = $1',
      [productId]
    );
    return rows[0] || null;
  }

  async findProductStock(productId) {
    const { rows } = await pool.query(
      'SELECT stock FROM products_demo WHERE id = $1',
      [productId]
    );
    return rows[0]?.stock ?? null;
  }

  async findSwitchById(switchId) {
    const { rows } = await pool.query(
      'SELECT price_per_switch, stock, name FROM switches WHERE id = $1',
      [switchId]
    );
    return rows[0] || null;
  }

  async findSwitchStockAndName(switchId) {
    const { rows } = await pool.query(
      'SELECT stock, name FROM switches WHERE id = $1',
      [switchId]
    );
    return rows[0] || null;
  }

  async lockProductStock(client, productId) {
    const { rows } = await client.query(
      'SELECT stock FROM products_demo WHERE id = $1 FOR UPDATE',
      [productId]
    );
    return rows[0]?.stock ?? null;
  }

  async lockSwitchStock(client, switchId) {
    const { rows } = await client.query(
      'SELECT stock FROM switches WHERE id = $1 FOR UPDATE',
      [switchId]
    );
    return rows[0]?.stock ?? null;
  }

  async decreaseProductStock(client, quantity, productId) {
    await client.query(
      'UPDATE products_demo SET stock = stock - $1 WHERE id = $2',
      [quantity, productId]
    );
  }

  async decreaseSwitchStock(client, quantity, switchId) {
    await client.query(
      'UPDATE switches SET stock = stock - $1 WHERE id = $2',
      [quantity, switchId]
    );
  }

  async insertProduct(client, { name, description, basePrice, switchCount, baseSwitchId }) {
    const { rows } = await client.query(
      `INSERT INTO products_demo (name, description, base_price, switch_count, base_switch_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, base_price, switch_count, base_switch_id`,
      [name, description || null, basePrice, switchCount, baseSwitchId]
    );
    return rows[0];
  }

  async insertAvailableSwitch(client, productId, switchId, displayOrder) {
    await client.query(
      `INSERT INTO product_available_switches (product_id, switch_id, display_order)
       VALUES ($1, $2, $3)`,
      [productId, switchId, displayOrder]
    );
  }

  async insertSpecification(client, productId, spec) {
    await client.query(
      `INSERT INTO product_specifications (product_id, spec_key, spec_value, depends_on_switch, display_order)
       VALUES ($1, $2, $3, $4, $5)`,
      [productId, spec.key, spec.value, spec.depends_on_switch || false, spec.display_order || 0]
    );
  }

  async insertEquipment(client, productId, itemName, displayOrder) {
    await client.query(
      `INSERT INTO product_equipment (product_id, item_name, display_order)
       VALUES ($1, $2, $3)`,
      [productId, itemName, displayOrder]
    );
  }

  async insertImage(client, url, altText) {
    const { rows } = await client.query(
      'INSERT INTO images (image_url, alt_text) VALUES ($1, $2) RETURNING id',
      [url, altText || '']
    );
    return rows[0].id;
  }

  async linkProductImage(client, productId, imageId, sortOrder) {
    await client.query(
      'INSERT INTO product_images (product_id, image_id, sort_order) VALUES ($1, $2, $3)',
      [productId, imageId, sortOrder || 0]
    );
  }
}

module.exports = new ProductRepository();
