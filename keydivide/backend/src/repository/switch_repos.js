const pool = require('../config/db');
const { syncSequence } = require('../utils/syncSequence');

class SwitchRepository {
  async findAllForAdmin() {
    const { rows } = await pool.query(`
      SELECT id, name, type, actuation_force, bottom_force, tactile_force,
             travel_length, price_per_switch, stock, image_url
      FROM switches
      ORDER BY type, name
    `);
    return rows;
  }

  async findById(switchId) {
    const { rows } = await pool.query(
      `SELECT id, name, type, actuation_force, bottom_force, tactile_force,
              travel_length, price_per_switch, stock, image_url
       FROM switches WHERE id = $1`,
      [switchId]
    );
    return rows[0] || null;
  }

  async insertSwitch(data) {
    await syncSequence('switches');

    const { rows } = await pool.query(
      `INSERT INTO switches (
        name, type, actuation_force, bottom_force, tactile_force,
        travel_length, price_per_switch, stock, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, name, type, actuation_force, bottom_force, tactile_force,
                travel_length, price_per_switch, stock, image_url`,
      [
        data.name,
        data.type,
        data.actuationForce,
        data.bottomForce,
        data.tactileForce,
        data.travelLength,
        data.pricePerSwitch,
        data.stock,
        data.imageUrl || null,
      ]
    );
    return rows[0];
  }

  async updateSwitch(switchId, data) {
    const { rows } = await pool.query(
      `UPDATE switches SET
        name = $1, type = $2, actuation_force = $3, bottom_force = $4,
        tactile_force = $5, travel_length = $6, price_per_switch = $7,
        stock = $8, image_url = $9
       WHERE id = $10
       RETURNING id, name, type, actuation_force, bottom_force, tactile_force,
                 travel_length, price_per_switch, stock, image_url`,
      [
        data.name,
        data.type,
        data.actuationForce,
        data.bottomForce,
        data.tactileForce,
        data.travelLength,
        data.pricePerSwitch,
        data.stock,
        data.imageUrl || null,
        switchId,
      ]
    );
    return rows[0] || null;
  }

  async deleteById(switchId) {
    const { rowCount } = await pool.query('DELETE FROM switches WHERE id = $1', [switchId]);
    return rowCount > 0;
  }
}

module.exports = new SwitchRepository();
