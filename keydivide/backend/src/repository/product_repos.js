const pool = require('../config/db');
const { syncSequence, syncSequences } = require('../utils/syncSequence');

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
        s.type as base_switch_type,
        COALESCE(
          (
            SELECT array_agg(DISTINCT sw.type ORDER BY sw.type)
            FROM product_available_switches pas
            JOIN switches sw ON pas.switch_id = sw.id
            WHERE pas.product_id = p.id
          ),
          CASE WHEN s.type IS NOT NULL THEN ARRAY[s.type] ELSE ARRAY[]::varchar[] END
        ) as switch_types,
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
          s.tactile_force, s.travel_length, s.price_per_switch, s.image_url,
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

  async findAvailableSwitchIds(client, productId) {
    const { rows } = await client.query(
      `SELECT switch_id FROM product_available_switches
       WHERE product_id = $1 ORDER BY display_order`,
      [productId]
    );
    return rows.map((r) => r.switch_id);
  }

  async findAdminById(client, productId) {
    const product = await this.findBasicById(client, productId);
    if (!product) return null;

    const [images, specifications, equipment, availableSwitchIds] = await Promise.all([
      this.findImagesByProductId(client, productId),
      this.findSpecificationsByProductId(client, productId),
      this.findEquipmentByProductId(client, productId),
      this.findAvailableSwitchIds(client, productId),
    ]);

    const stockRow = await client.query(
      'SELECT stock FROM products_demo WHERE id = $1',
      [productId]
    );

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      base_price: parseFloat(product.base_price),
      switch_count: product.switch_count,
      base_switch_id: product.base_switch_id,
      stock: stockRow.rows[0]?.stock ?? 0,
      available_switch_ids: availableSwitchIds,
      cover_image: images[0]
        ? { url: images[0].image_url, alt_text: images[0].alt_text }
        : null,
      gallery_images: images.slice(1).map((img) => ({
        url: img.image_url,
        alt_text: img.alt_text,
      })),
      image_urls: images.map((img, index) => ({
        url: img.image_url,
        alt_text: img.alt_text,
        sort_order: index + 1,
      })),
      specifications: specifications.map((spec, index) => ({
        key: spec.spec_key,
        value: spec.spec_value,
        depends_on_switch: spec.depends_on_switch,
        display_order: spec.display_order ?? index,
      })),
      equipment: equipment.map((eq) => eq.item_name),
    };
  }

  async deleteProductRelations(client, productId) {
    await client.query('DELETE FROM product_available_switches WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM product_specifications WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM product_equipment WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
  }

  async deleteProduct(client, productId) {
    await this.deleteProductRelations(client, productId);
    const { rowCount } = await client.query('DELETE FROM products_demo WHERE id = $1', [productId]);
    return rowCount > 0;
  }

  async updateProductCore(client, productId, { name, description, basePrice, switchCount, baseSwitchId, stock }) {
    const { rows } = await client.query(
      `UPDATE products_demo
       SET name = $1, description = $2, base_price = $3, switch_count = $4,
           base_switch_id = $5, stock = $6
       WHERE id = $7
       RETURNING id, name, base_price, switch_count, base_switch_id, stock`,
      [name, description || null, basePrice, switchCount, baseSwitchId, stock, productId]
    );
    return rows[0] || null;
  }

  async insertProduct(client, { name, description, basePrice, switchCount, baseSwitchId, stock = 0 }) {
    await syncSequence('products_demo', client);

    const { rows } = await client.query(
      `INSERT INTO products_demo (name, description, base_price, switch_count, base_switch_id, stock)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, base_price, switch_count, base_switch_id, stock`,
      [name, description || null, basePrice, switchCount, baseSwitchId, stock]
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
    await syncSequence('product_specifications', client);

    await client.query(
      `INSERT INTO product_specifications (product_id, spec_key, spec_value, depends_on_switch, display_order)
       VALUES ($1, $2, $3, $4, $5)`,
      [productId, spec.key, spec.value, spec.depends_on_switch || false, spec.display_order || 0]
    );
  }

  async insertEquipment(client, productId, itemName, displayOrder) {
    await syncSequence('product_equipment', client);

    await client.query(
      `INSERT INTO product_equipment (product_id, item_name, display_order)
       VALUES ($1, $2, $3)`,
      [productId, itemName, displayOrder]
    );
  }

  async insertImage(client, url, altText) {
    await syncSequence('images', client);

    const { rows } = await client.query(
      'INSERT INTO images (image_url, alt_text) VALUES ($1, $2) RETURNING id',
      [url, altText || '']
    );
    return rows[0].id;
  }

  async linkProductImage(client, productId, imageId, sortOrder) {
    await syncSequence('product_images', client);

    await client.query(
      'INSERT INTO product_images (product_id, image_id, sort_order) VALUES ($1, $2, $3)',
      [productId, imageId, sortOrder || 0]
    );
  }
}

module.exports = new ProductRepository();
