const { describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const AppError = require('../src/utils/AppError');
const { AuthService } = require('../src/services/auth_service');

function createAuthService(overrides = {}) {
  const authRepository = {
    findByLoginOrEmail: mock.fn(async () => []),
    createUser: mock.fn(async (data) => ({
      id: 1,
      login: data.login,
      email: data.email,
      surname: data.surname,
      name: data.name,
      role: data.role,
      created_at: '2026-05-30T00:00:00.000Z',
    })),
    findByLogin: mock.fn(async () => null),
    findAuthById: mock.fn(async () => null),
    findById: mock.fn(async () => null),
    ...overrides.authRepository,
  };

  return {
    service: new AuthService({
      authRepository,
      bcrypt: overrides.bcrypt ?? bcrypt,
    }),
    authRepository,
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

const validRegisterPayload = {
  login: 'ivanov',
  email: 'ivanov@test.com',
  surname: 'Иванов',
  name: 'Иван',
  password: 'Secret12',
};

describe('AuthService.register', () => {
  it('rejects invalid email format', async () => {
    const { service } = createAuthService();
    await assertAppError(
      service.register({ ...validRegisterPayload, email: 'not-an-email' }),
      { message: 'Некорректный формат email' }
    );
  });

  it('rejects password shorter than 8 characters', async () => {
    const { service } = createAuthService();
    await assertAppError(
      service.register({ ...validRegisterPayload, password: 'Ab1' }),
      { message: 'Пароль должен содержать минимум 8 символов' }
    );
  });

  it('rejects password without uppercase, lowercase or digit', async () => {
    const { service } = createAuthService();
    await assertAppError(
      service.register({ ...validRegisterPayload, password: 'secretsecret' }),
      { message: 'Пароль должен содержать заглавные и строчные буквы, а также цифры' }
    );
  });

  it('rejects duplicate email', async () => {
    const { service } = createAuthService({
      authRepository: {
        findByLoginOrEmail: mock.fn(async () => [{ login: 'other', email: 'ivanov@test.com' }]),
      },
    });

    await assertAppError(
      service.register(validRegisterPayload),
      { message: 'Пользователь с таким email уже зарегистрирован' }
    );
  });

  it('rejects duplicate login', async () => {
    const { service } = createAuthService({
      authRepository: {
        findByLoginOrEmail: mock.fn(async () => [{ login: 'ivanov', email: 'other@test.com' }]),
      },
    });

    await assertAppError(
      service.register(validRegisterPayload),
      { message: 'Пользователь с таким логином уже существует' }
    );
  });

  it('hashes password and creates user', async () => {
    const { service, authRepository } = createAuthService();

    const user = await service.register(validRegisterPayload);

    assert.equal(user.login, 'ivanov');
    assert.equal(user.email, 'ivanov@test.com');
    assert.equal(authRepository.createUser.mock.calls.length, 1);

    const createArgs = authRepository.createUser.mock.calls[0].arguments[0];
    assert.equal(createArgs.role, 'user');
    assert.notEqual(createArgs.passwordHash, validRegisterPayload.password);
    assert.equal(await bcrypt.compare(validRegisterPayload.password, createArgs.passwordHash), true);
  });
});

describe('AuthService.login', () => {
  it('returns 401 when user is not found', async () => {
    const { service } = createAuthService();
    await assertAppError(
      service.login({ login: 'unknown', password: 'Secret12' }),
      { message: 'Неверный логин или пароль', statusCode: 401 }
    );
  });

  it('returns 401 when password is wrong', async () => {
    const passwordHash = await bcrypt.hash('Secret12', 10);
    const { service } = createAuthService({
      authRepository: {
        findByLogin: mock.fn(async () => ({
          id: 1,
          login: 'ivanov',
          password_hash: passwordHash,
        })),
      },
    });

    await assertAppError(
      service.login({ login: 'ivanov', password: 'WrongPass1' }),
      { message: 'Неверный логин или пароль', statusCode: 401 }
    );
  });

  it('returns user when credentials are valid', async () => {
    const passwordHash = await bcrypt.hash('Secret12', 10);
    const dbUser = {
      id: 1,
      login: 'ivanov',
      email: 'ivanov@test.com',
      name: 'Иван',
      surname: 'Иванов',
      password_hash: passwordHash,
      role: 'user',
    };

    const { service, authRepository } = createAuthService({
      authRepository: {
        findByLogin: mock.fn(async () => dbUser),
      },
    });

    const user = await service.login({ login: 'ivanov', password: 'Secret12' });
    assert.deepEqual(user, dbUser);
    assert.deepEqual(authRepository.findByLogin.mock.calls[0].arguments, ['ivanov']);
  });
});

describe('AuthService.refreshUser', () => {
  it('returns 401 when user no longer exists', async () => {
    const { service } = createAuthService();
    await assertAppError(service.refreshUser(99), {
      message: 'Пользователь не найден',
      statusCode: 401,
    });
  });

  it('returns user data for refresh', async () => {
    const authUser = { id: 5, login: 'ivanov', role: 'user' };
    const { service } = createAuthService({
      authRepository: {
        findAuthById: mock.fn(async () => authUser),
      },
    });

    const user = await service.refreshUser(5);
    assert.deepEqual(user, authUser);
  });
});

describe('AuthService.checkAuth', () => {
  it('returns null when user is missing', async () => {
    const { service } = createAuthService();
    const user = await service.checkAuth(1);
    assert.equal(user, null);
  });

  it('returns user profile', async () => {
    const profile = {
      id: 1,
      login: 'ivanov',
      email: 'ivanov@test.com',
      name: 'Иван',
      surname: 'Иванов',
      role: 'user',
    };

    const { service } = createAuthService({
      authRepository: {
        findById: mock.fn(async () => profile),
      },
    });

    const user = await service.checkAuth(1);
    assert.deepEqual(user, profile);
  });
});

describe('AuthService.formatPublicUser', () => {
  it('returns user fields without password_hash', () => {
    const { service } = createAuthService();
    const publicUser = service.formatPublicUser({
      id: 1,
      login: 'ivanov',
      email: 'ivanov@test.com',
      name: 'Иван',
      surname: 'Иванов',
      role: 'user',
      password_hash: 'must-not-leak',
    });

    assert.deepEqual(publicUser, {
      id: 1,
      login: 'ivanov',
      email: 'ivanov@test.com',
      name: 'Иван',
      surname: 'Иванов',
      role: 'user',
    });
    assert.equal('password_hash' in publicUser, false);
  });
});
