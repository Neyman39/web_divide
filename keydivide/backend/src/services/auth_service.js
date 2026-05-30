const bcrypt = require('bcrypt');
const defaultAuthRepository = require('../repository/auth_repos');
const AppError = require('../utils/AppError');

class AuthService {
  constructor(deps = {}) {
    this.authRepository = deps.authRepository ?? defaultAuthRepository;
    this.bcrypt = deps.bcrypt ?? bcrypt;
  }

  async register({ login, email, surname, name, password }) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Некорректный формат email');
    }

    if (password.length < 8) {
      throw new AppError('Пароль должен содержать минимум 8 символов');
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      throw new AppError('Пароль должен содержать заглавные и строчные буквы, а также цифры');
    }

    const existingUsers = await this.authRepository.findByLoginOrEmail(login, email);
    if (existingUsers.length > 0) {
      const existing = existingUsers[0];
      if (existing.email === email) {
        throw new AppError('Пользователь с таким email уже зарегистрирован');
      }
      if (existing.login === login) {
        throw new AppError('Пользователь с таким логином уже существует');
      }
    }

    const passwordHash = await this.bcrypt.hash(password, 10);
    return this.authRepository.createUser({
      login,
      email,
      surname,
      name,
      passwordHash,
      role: 'user',
    });
  }

  async login({ login, password }) {
    const user = await this.authRepository.findByLogin(login);
    if (!user) {
      throw new AppError('Неверный логин или пароль', 401);
    }

    const isValidPassword = await this.bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Неверный логин или пароль', 401);
    }

    return user;
  }

  async refreshUser(userId) {
    const user = await this.authRepository.findAuthById(userId);
    if (!user) {
      throw new AppError('Пользователь не найден', 401);
    }
    return user;
  }

  async checkAuth(userId) {
    const user = await this.authRepository.findById(userId);
    return user;
  }

  formatPublicUser(user) {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.role,
    };
  }
}

module.exports = new AuthService();
module.exports.AuthService = AuthService;
