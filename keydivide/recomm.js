// Массив с товарами
const products = [
    { id: 1, name: 'Продукт 1', price: 10.99, recommended: false },
    { id: 2, name: 'Продукт 2', price: 15.99, recommended: true },
    { id: 3, name: 'Продукт 3', price: 5.99, recommended: false },
    { id: 4, name: 'Продукт 4', price: 20.99, recommended: true },
    { id: 5, name: 'Продукт 5', price: 8.99, recommended: false }
  ];
  
  // Функция для отображения товаров
  function displayProducts(filteredProducts) {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
  
    filteredProducts.forEach(product => {
      const productElement = document.createElement('div');
      productElement.textContent = `${product.name} - $${product.price.toFixed(2)}`;
      productsContainer.appendChild(productElement);
    });
  }
  
  // Функция для сортировки по возрастанию цены
  function sortByPriceAsc() {
    const sortedProducts = [...products].sort((a, b) => a.price - b.price);
    displayProducts(sortedProducts);
  }
  
  // Функция для сортировки по убыванию цены
  function sortByPriceDesc() {
    const sortedProducts = [...products].sort((a, b) => b.price - a.price);
    displayProducts(sortedProducts);
  }
  
  // Функция для отображения рекомендуемых товаров
  function showRecommended() {
    const recommendedProducts = products.filter(product => product.recommended);
    displayProducts(recommendedProducts);
  }
  
  // Инициальное отображение всех товаров
  displayProducts(products);