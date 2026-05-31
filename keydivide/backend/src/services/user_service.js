const userRepository = require('../repository/user_repos');
const AppError = require('../utils/AppError');

class UserService {
  async deleteByEmail(email) {
    const deletedUser = await userRepository.deleteByEmail(email);
    if (!deletedUser) {
      throw new AppError('Пользователь с таким email не найден', 404);
    }

    await userRepository.resetIdSequence();
    return deletedUser;
  }
}

module.exports = new UserService();
