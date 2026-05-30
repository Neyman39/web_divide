const pool = require('../config/db');

class AuthRepository {
  async findByLoginOrEmail(login, email) {
    const { rows } = await pool.query(
      'SELECT login, email FROM users WHERE login = $1 OR email = $2',
      [login, email]
    );
    return rows;
  }

  async createUser({ login, email, surname, name, passwordHash, role }) {
    const { rows } = await pool.query(
      `INSERT INTO users (login, email, surname, name, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, login, email, surname, name, role, created_at`,
      [login, email, surname, name, passwordHash, role]
    );
    return rows[0];
  }

  async findByLogin(login) {
    const { rows } = await pool.query(
      'SELECT id, login, email, name, surname, password_hash, role FROM users WHERE login = $1',
      [login]
    );
    return rows[0] || null;
  }

  async findById(userId) {
    const { rows } = await pool.query(
      'SELECT id, login, email, name, surname, role FROM users WHERE id = $1',
      [userId]
    );
    return rows[0] || null;
  }

  async findAuthById(userId) {
    const { rows } = await pool.query(
      'SELECT id, login, role FROM users WHERE id = $1',
      [userId]
    );
    return rows[0] || null;
  }
}

module.exports = new AuthRepository();
