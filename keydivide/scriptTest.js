document.addEventListener('DOMContentLoaded', function() {
  // Получаем все элементы
  const hotspots = document.querySelectorAll('.hotspot');
  const infoCards = document.querySelectorAll('.info-card');
  
  // Добавляем обработчики для горячих точек
  hotspots.forEach(hotspot => {
    hotspot.addEventListener('click', function() {
      const infoId = this.getAttribute('data-info');
      
      // Скрываем все карточки
      infoCards.forEach(card => {
        card.classList.remove('active');
      });
      
      // Показываем выбранную карточку
      document.getElementById(infoId).classList.add('active');
    });
  });
  
  // Добавляем обработчик для плавного появления при загрузке
  const ergoSection = document.querySelector('.ergonomics-section');
  ergoSection.style.opacity = '0';
  
  setTimeout(() => {
    ergoSection.style.transition = 'opacity 0.5s ease';
    ergoSection.style.opacity = '1';
  }, 300);
  
  // Добавляем интерактивность для мобильных устройств
  if ('ontouchstart' in window) {
    hotspots.forEach(hotspot => {
      hotspot.style.width = '40px';
      hotspot.style.height = '40px';
      
      const tooltip = hotspot.querySelector('.hotspot-tooltip');
      tooltip.style.top = '-45px';
      tooltip.style.fontSize = '16px';
    });
  }
});





/*конструктор*/
document.addEventListener('DOMContentLoaded', function() {
  // Элементы конструктора
  const configurator = document.getElementById('keyboard-configurator');
  const openConfiguratorBtns = document.querySelectorAll('.open-configurator');
  const closeConfigurator = document.querySelector('.close-configurator');
  const steps = document.querySelectorAll('.step');
  const stepContents = document.querySelectorAll('.step-content');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const finishBtn = document.querySelector('.finish-btn');
  const optionCards = document.querySelectorAll('.option-card');
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  
  // Данные о ценах
  const prices = {
    form: {
      ortho: 8000,
      split: 10000,
      trad: 7000
    },
    switch: {
      linear: 2000,
      tactile: 2500,
      clicky: 3000
    },
    keycaps: {
      abs: 1500,
      pbt: 2500,
      custom: 5000
    },
    extras: {
      backlight: 3500,
      bluetooth: 4200,
      wristRest: 2800
    }
  };
  
  // Текущая конфигурация
  let currentConfig = {
    form: null,
    switch: null,
    keycaps: null,
    extras: []
  };
  
  let currentStep = 1;
  
  // Открытие конструктора
  openConfiguratorBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      configurator.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
  
  // Закрытие конструктора
  closeConfigurator.addEventListener('click', function() {
    configurator.classList.remove('active');
    document.body.style.overflow = '';
  });
  
  // Навигация по шагам
  function updateSteps() {
    // Обновляем шаги
    steps.forEach(step => {
      const stepNum = parseInt(step.getAttribute('data-step'));
      
      if (stepNum < currentStep) {
        step.classList.add('completed');
        step.classList.remove('active');
      } else if (stepNum === currentStep) {
        step.classList.add('active');
        step.classList.remove('completed');
      } else {
        step.classList.remove('active', 'completed');
      }
    });
    
    // Обновляем содержимое шагов
    stepContents.forEach(content => {
      const contentStep = parseInt(content.getAttribute('data-step-content'));
      
      if (contentStep === currentStep) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
    
    // Обновляем кнопки навигации
    prevBtn.disabled = currentStep === 1;
    
    if (currentStep === steps.length) {
      nextBtn.classList.add('hidden');
      finishBtn.classList.remove('hidden');
      updateSummary();
    } else {
      nextBtn.classList.remove('hidden');
      finishBtn.classList.add('hidden');
    }
    
    // Проверяем, можно ли перейти дальше
    if (currentStep === 1 && !currentConfig.form) {
      nextBtn.disabled = true;
    } else if (currentStep === 2 && !currentConfig.switch) {
      nextBtn.disabled = true;
    } else if (currentStep === 3 && !currentConfig.keycaps) {
      nextBtn.disabled = true;
    } else {
      nextBtn.disabled = false;
    }
  }
  
  // Выбор опций
  optionCards.forEach(card => {
    card.addEventListener('click', function() {
      const parentStep = this.closest('.step-content');
      const stepId = parentStep.getAttribute('data-step-content');
      
      // Убираем выделение у всех карточек в этом шаге
      parentStep.querySelectorAll('.option-card').forEach(c => {
        c.classList.remove('selected');
      });
      
      // Выделяем текущую карточку
      this.classList.add('selected');
      
      // Сохраняем выбор
      if (stepId === '1') {
        currentConfig.form = this.getAttribute('data-form');
      } else if (stepId === '2') {
        currentConfig.switch = this.getAttribute('data-switch');
      } else if (stepId === '3') {
        currentConfig.keycaps = this.getAttribute('data-keycaps');
      }
      
      // Активируем кнопку "Далее", если сделан выбор
      updateSteps();
    });
  });
  
  // Обработка чекбоксов
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        currentConfig.extras.push(this.value);
      } else {
        currentConfig.extras = currentConfig.extras.filter(item => item !== this.value);
      }
      updateSummary();
    });
  });
  
  // 1. Обновляем функцию updateSummary
function updateSummary() {
  // Обновляем превью формы
  if (currentConfig.form) {
    document.getElementById('form-preview').src = `assets/images/${currentConfig.form}-form.png`;
    document.getElementById('form-spec').textContent = getFormName(currentConfig.form);
  }

  // Обновляем спецификации
  document.getElementById('switch-spec').textContent = currentConfig.switch 
    ? getSwitchName(currentConfig.switch) 
    : 'Не выбрано';
  
  document.getElementById('keycaps-spec').textContent = currentConfig.keycaps 
    ? getKeycapsName(currentConfig.keycaps) 
    : 'Не выбрано';

  // Обрабатываем дополнительные функции
  const extrasList = currentConfig.extras
    .filter(extra => prices.extras[extra])
    .map(extra => getExtraName(extra));
  
  document.getElementById('extras-spec').textContent = 
    extrasList.length > 0 ? extrasList.join(', ') : 'Нет';

  // Пересчитываем и обновляем итоговую стоимость
  updateTotalPrice();
}

// Добавляем отдельную функцию для расчета цены
function updateTotalPrice() {
  let total = 0;

  // Считаем стоимость формы
  if (currentConfig.form && prices.form[currentConfig.form]) {
    total += prices.form[currentConfig.form];
  }

  // Считаем стоимость переключателей
  if (currentConfig.switch && prices.switch[currentConfig.switch]) {
    total += prices.switch[currentConfig.switch];
  }

  // Считаем стоимость кейкапов
  if (currentConfig.keycaps && prices.keycaps[currentConfig.keycaps]) {
    total += prices.keycaps[currentConfig.keycaps];
  }

  // Считаем дополнительные опции
  currentConfig.extras.forEach(extra => {
    if (prices.extras[extra]) {
      total += prices.extras[extra];
    }
  });

  // Обновляем отображение цены
  document.getElementById('total-price').textContent = total.toLocaleString('ru-RU');
}

//  Обновляем обработчик чекбоксов
checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', function() {
    if (this.checked) {
      currentConfig.extras.push(this.value);
    } else {
      currentConfig.extras = currentConfig.extras.filter(item => item !== this.value);
    }
    updateSummary(); // Обязательно вызываем обновление
  });
});


  // Вспомогательные функции для названий
  function getFormName(key) {
    const names = {
      ortho: 'Ортолинейная',
      split: 'Раздельная',
      trad: 'Традиционная'
    };
    return names[key] || '';
  }
  
  function getSwitchName(key) {
    const names = {
      linear: 'Линейные',
      tactile: 'Тактильные',
      clicky: 'Кликающие'
    };
    return names[key] || '';
  }
  
  function getKeycapsName(key) {
    const names = {
      abs: 'ABS пластик',
      pbt: 'PBT пластик',
      custom: 'Кастомные'
    };
    return names[key] || '';
  }
  
  function getExtraName(key) {
    const names = {
      backlight: 'RGB подсветка (+3,500₽)',
      bluetooth: 'Bluetooth модуль (+4,200₽)',
      wristRest: 'Подставка под запястья (+2,800₽)'
    };
    return names[key] || key;
  }
  
  // Расчет общей стоимости
  function calculateTotalPrice() {
    let total = 0;
    
    // Базовая стоимость формы
    if (currentConfig.form && prices.form[currentConfig.form]) {
      total += Number(prices.form[currentConfig.form]) || 0;
    }
    
    // Стоимость переключателей
    if (currentConfig.switch && prices.switch[currentConfig.switch]) {
      total += Number(prices.switch[currentConfig.switch]) || 0;
    }
    
    // Стоимость кейкапов
    if (currentConfig.keycaps && prices.keycaps[currentConfig.keycaps]) {
      total += Number(prices.keycaps[currentConfig.keycaps]) || 0;
    }
    
    // Дополнительные опции - исправленный код
    if (Array.isArray(currentConfig.extras)) {
      currentConfig.extras.forEach(extra => {
        if (extra && prices.extras[extra]) {
          total += Number(prices.extras[extra]) || 0;
        }
      });
    }
    
    return total;
  }
  

  
  // Навигация
  nextBtn.addEventListener('click', function() {
    if (currentStep < steps.length) {
      currentStep++;
      updateSteps();
    }
  });
  
  prevBtn.addEventListener('click', function() {
    if (currentStep > 1) {
      currentStep--;
      updateSteps();
    }
  });
  
  // Завершение сборки
  finishBtn.addEventListener('click', function() {
    if (!currentConfig.form || !currentConfig.switch || !currentConfig.keycaps) {
      alert('Пожалуйста, выберите все основные компоненты (форма, переключатели и кейкапы)');
      return;
    }
    
    const totalPrice = calculateTotalPrice();
    const confirmation = confirm(`Вы хотите оформить заказ на сборку клавиатуры за ${totalPrice.toLocaleString('ru-RU')}₽?\n\nВаша конфигурация:
    \nФорма: ${getFormName(currentConfig.form)}\nПереключатели: ${getSwitchName(currentConfig.switch)}\nКейкапы: ${getKeycapsName(currentConfig.keycaps)}
    \nДополнительно: ${currentConfig.extras.length > 0 ? currentConfig.extras.map(getExtraName).join(', ') : 'Нет'}`);
    
    if (confirmation) {
      // Здесь можно добавить отправку данных на сервер
      // Например, через fetch или AJAX
      sendOrderToServer(currentConfig, totalPrice);
      
      alert('Ваш заказ принят в обработку! Мы свяжемся с вами для уточнения деталей.');
      configurator.classList.remove('active');
      document.body.style.overflow = '';
      
      // Сброс конструктора
      resetConfigurator();
    }
  });
  
  // Функция для отправки заказа на сервер
  function sendOrderToServer(config, price) {
    // В реальном проекте здесь будет код для отправки данных
    console.log('Отправка заказа:', {
      configuration: config,
      totalPrice: price,
      timestamp: new Date().toISOString()
    });
    
    
  }
  
  // Сброс конструктора
  function resetConfigurator() {
    currentStep = 1;
    currentConfig = {
      form: null,
      switch: null,
      keycaps: null,
      extras: []
    };
    
    // Сброс выбранных элементов
    optionCards.forEach(card => card.classList.remove('selected'));
    checkboxes.forEach(checkbox => checkbox.checked = false);
    
    updateSteps();
  }
  
  // Закрытие по клику вне модального окна
  configurator.addEventListener('click', function(e) {
    if (e.target === configurator) {
      configurator.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  
  // Закрытие по ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && configurator.classList.contains('active')) {
      configurator.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  
  // Инициализация
  updateSteps();
});
  