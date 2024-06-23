// Определяем объект с различными конфигурациями и их ценами
const configurations = {
    'категория1': {
      'конфигурация1': 1700,
      'конфигурация2': 1480,
      'конфигурация3': 1035,
      'конфигурация4': 715
    },
    'категория2': {
      'конфигурация1': 0,
      'конфигурация2': 500
    },
    'категория3': {
      'конфигурация1': 500,
      'конфигурация2': 0
    },
    'категория4': {
        'конфигурация1': 0,
        'конфигурация2': 1000
    }
  };
  
  // Получаем элементы на странице
  const configButtons = document.querySelectorAll('.config-button');
  const priceElement = document.getElementById('price');
  
  // Выбранные конфигурации по умолчанию
  let selectedConfigs = {
    'категория1': 'конфигурация1',
    'категория2': 'конфигурация1',
    'категория3': 'конфигурация1',
    'категория4': 'конфигурация1'
  };
  
  // Функция для обновления обводки кнопок
  function updateButtonBorder() {
    configButtons.forEach(button => {
      const category = button.getAttribute('data-category');
      const config = button.getAttribute('data-config');
      button.style.border = selectedConfigs[category] === config ? '1.5px solid rgb(255, 122, 105)' : '1.5px solid rgb(96, 96, 96)';
    });
  }
  
  // Обработчик нажатия на кнопки конфигурации
  configButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Получаем выбранную категорию и конфигурацию из атрибутов
      const category = this.getAttribute('data-category');
      const config = this.getAttribute('data-config');
  
      // Обновляем выбранную конфигурацию для этой категории
      selectedConfigs[category] = config;
  
      // Обновляем цену на странице
      let totalPrice = 0;
      for (const cat in selectedConfigs) {
        totalPrice += configurations[cat][selectedConfigs[cat]];
      }
      priceElement.textContent = totalPrice + ' ₽';
  
      // Обновляем обводку кнопок
      updateButtonBorder();
    });
  });
  
  // Инициализация обводки кнопок при загрузке страницы
  updateButtonBorder();
  