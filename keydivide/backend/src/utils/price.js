// Копейки в БД хранятся как INTEGER; pg возвращает NUMERIC строками вида "10679200.00"
const toKopecks = (value) => Math.round(Number(value));

module.exports = { toKopecks };
