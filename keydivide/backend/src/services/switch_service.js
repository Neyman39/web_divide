const switchRepository = require('../repository/switch_repos');
const AppError = require('../utils/AppError');

const SWITCH_TYPES = ['линейный', 'тактильный', 'кликающий'];

class SwitchService {
  async getAllForAdmin() {
    return switchRepository.findAllForAdmin();
  }

  async getByIdForAdmin(switchId) {
    const sw = await switchRepository.findById(switchId);
    if (!sw) {
      throw new AppError('Свитч не найден', 404);
    }
    return sw;
  }

  _parsePayload(payload) {
    const {
      name,
      type,
      actuation_force,
      bottom_force,
      tactile_force,
      travel_length,
      price_per_switch,
      stock,
      image_url,
    } = payload;

    if (!name?.trim()) {
      throw new AppError('Название свитча обязательно');
    }

    if (!SWITCH_TYPES.includes(type)) {
      throw new AppError('Тип должен быть: линейный, тактильный или кликающий');
    }

    if (actuation_force == null || bottom_force == null) {
      throw new AppError('Сила срабатывания и сила до упора обязательны');
    }

    if (!travel_length?.toString().trim()) {
      throw new AppError('Длина хода обязательна');
    }

    if (price_per_switch == null || Number(price_per_switch) < 0) {
      throw new AppError('Укажите корректную цену за штуку');
    }

    const stockValue = stock == null ? 0 : parseInt(stock, 10);
    if (Number.isNaN(stockValue) || stockValue < 0) {
      throw new AppError('Количество на складе должно быть неотрицательным числом');
    }

    const tactileForce = tactile_force === '' || tactile_force == null
      ? null
      : parseInt(tactile_force, 10);

    if (tactile_force != null && tactile_force !== '' && Number.isNaN(tactileForce)) {
      throw new AppError('Сила тактильности должна быть числом');
    }

    return {
      name: name.trim(),
      type,
      actuationForce: parseInt(actuation_force, 10),
      bottomForce: parseInt(bottom_force, 10),
      tactileForce,
      travelLength: travel_length.toString().trim(),
      pricePerSwitch: Math.round(Number(price_per_switch) * 100),
      stock: stockValue,
      imageUrl: image_url?.trim() || null,
    };
  }

  async createSwitch(payload) {
    const data = this._parsePayload(payload);

    try {
      return await switchRepository.insertSwitch(data);
    } catch (err) {
      if (err.code === '23505') {
        throw new AppError('Конфликт ID в базе. Попробуйте сохранить ещё раз.', 409);
      }
      throw err;
    }
  }

  async updateSwitch(switchId, payload) {
    const data = this._parsePayload(payload);
    const updated = await switchRepository.updateSwitch(switchId, data);
    if (!updated) {
      throw new AppError('Свитч не найден', 404);
    }
    return updated;
  }

  async deleteSwitch(switchId) {
    try {
      const deleted = await switchRepository.deleteById(switchId);
      if (!deleted) {
        throw new AppError('Свитч не найден', 404);
      }
      return { id: switchId };
    } catch (err) {
      if (err.code === '23503') {
        throw new AppError(
          'Нельзя удалить свитч: он используется в клавиатурах, заказах или корзинах',
          409
        );
      }
      throw err;
    }
  }
}

module.exports = new SwitchService();
module.exports.SwitchService = SwitchService;
module.exports.SWITCH_TYPES = SWITCH_TYPES;
