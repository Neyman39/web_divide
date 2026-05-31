const pool = require('../config/db');

class UserRepository {
  async deleteByEmail(email) {
    const { rows } = await pool.query(
      'DELETE FROM users WHERE email = $1 RETURNING id, login, email',
      [email]
    );
    return rows[0] || null;
  }

  async resetIdSequence() {
    await pool.query(
      "SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM users"
    );
  }
}

module.exports = new UserRepository();
