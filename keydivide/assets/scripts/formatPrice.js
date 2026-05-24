/** Цена в БД — копейки; на сайте показываем рубли */
function formatPriceRub(kopecks) {
  return `${Math.round(Number(kopecks) / 100).toLocaleString('ru-RU')} ₽`;
}
