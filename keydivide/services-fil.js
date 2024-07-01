// Массив с товарами
const productes = [
    { id: 7, name: 'Смазка переключателей', price: 1.400, img: 'assets/images/lubsw-main.png', link: "Карточка товара.html" },
    { id: 8, name: 'Шумоизоляция', price: 0.540, img: 'assets/images/foam-main.png', link: "card_foam.html" },
    { id: 9, name: 'Апгрейд стабилизаторов', price: 9.890, img: 'assets/images/stablub-main.png', link: "card-stablub.html" }
];
      
// Функция для отображения товаров в карточках
function displayproductess(filteredproductes) {
  const productContainer = document.querySelector('.product-container3');
  productContainer.innerHTML = '';

  filteredproductes.forEach(product => {

    const in_card13 = document.createElement('div');
    in_card13.classList.add('in_card13');

    const aLink = document.createElement('a');
    aLink.href = product.link;
    aLink.classList.add('in_card13');

    const productImg = document.createElement('img');
    productImg.src = product.img;
    aLink.appendChild(productImg);
    
    const productName = document.createElement('h4');
    productName.textContent = product.name;
    aLink.appendChild(productName);

    const productPrice = document.createElement('h5');
    productPrice.textContent = `${product.price.toFixed(3)} ₽`;
    aLink.appendChild(productPrice);

    in_card13.appendChild(aLink)
    productContainer.appendChild(in_card13);
    

  });
}

// Функция для сортировки и фильтрации товаров
function applyFilterD(filterType) {
  let filteredproductes;
  const filterBtn = document.querySelector('.filter-btn3 .filter-text3');

  switch (filterType) {
    case 'asce':
      filteredproductes = [...productes].sort((a, b) => a.price - b.price);
      filterBtn.textContent = 'По возрастанию цены';
      break;
    case 'desce':
      filteredproductes = [...productes].sort((a, b) => b.price - a.price);
      filterBtn.textContent = 'По убыванию цены';
      break;
    case 'recommended':
    default:
      filteredproductes = [...productes];
      filterBtn.textContent = 'Рекомендуемые';
  }

  displayproductess(filteredproductes);
  toggleFilterDropdowne();
}

// Функция для переключения выпадающего списка фильтрации
function toggleFilterDropdowne() {
  const filterDropdown = document.querySelector('.filter-dropdown3');
  filterDropdown.style.display = filterDropdown.style.display === 'none' ? 'block' : 'none';
}

// Инициальное отображение всех товаров
applyFilterD('allo');