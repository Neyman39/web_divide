function initMobileNavigation() {
    const burgerBtn = document.querySelector('.header__burger-btn');
    const mobileNavOverlay = document.getElementById('url');
    const closeBtn = document.querySelector('.mobile-nav-close');
    
    if (!burgerBtn || !mobileNavOverlay) return;
    
    // Открытие/закрытие меню по клику на бургер
    burgerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Предотвращаем всплытие
        const isMenuOpen = mobileNavOverlay.classList.contains('active');
    
        // Переключаем меню
        mobileNavOverlay.classList.toggle('active');
    
        // Переключаем скролл
        document.body.style.overflow = isMenuOpen ? '' : 'hidden';
        // console.log('Меню переключено'); // Для отладки
    });
    
    // // Закрытие меню по кнопке
    // closeBtn.addEventListener('click', function() {
    //     mobileNavOverlay.classList.remove('active');
    //     document.body.style.overflow = ''; // Восстанавливаем скролл
    // });
    
    // Свайп снизу вверх для закрытия меню с анимацией подъема
    let startY = 0;
    let currentY = 0;
    let isSwiping = false;
    const menuHeight = window.innerHeight; // Высота меню

    mobileNavOverlay.addEventListener('touchstart', function(e) {
        if (!mobileNavOverlay.classList.contains('active')) return;

        startY = e.touches[0].clientY;
        currentY = startY;
        isSwiping = true;

        // Отключаем transition для плавного перемещения
        mobileNavOverlay.style.transition = 'none';
    }, { passive: true });

    mobileNavOverlay.addEventListener('touchmove', function(e) {
        if (!isSwiping) return;
        
        currentY = e.touches[0].clientY;
        const diff = currentY - startY; // Отрицательное значение при свайпе снизу вверх
        
        // Разрешаем только свайп снизу вверх (отрицательное значение)
        if (diff < 0) {
            // Вычисляем насколько меню должно подняться
            const translateY = Math.max(diff, -menuHeight); // Ограничиваем максимальное смещение
            mobileNavOverlay.style.transform = `translateY(${translateY}px)`;
        }
    }, { passive: true });

    mobileNavOverlay.addEventListener('touchend', function(e) {
        if (!isSwiping) return;
        
        isSwiping = false;
        const diff = currentY - startY;
        const swipeDistance = Math.abs(diff);
        
        // Восстанавливаем transition
        mobileNavOverlay.style.transition = 'transform 0.3s';
        
        // Если свайп снизу вверх больше 100px или больше 30% высоты экрана - закрываем меню
        if (swipeDistance > 100 || swipeDistance > menuHeight * 0.3) {
            // Анимируем полное закрытие
            mobileNavOverlay.style.transform = `translateY(-${menuHeight}px)`;

            // Ждем завершения анимации и затем закрываем меню
            setTimeout(() => {
                closeMenu();
            }, 300);
        } else {
            // Иначе возвращаем на место
            mobileNavOverlay.style.transform = 'translateY(0)';
            mobileNavOverlay.style.opacity = '1';
        }
    }, { passive: true });

    // Функция закрытия меню (разблокировка скролла только здесь)
    function closeMenu() {
        mobileNavOverlay.classList.remove('active');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';

        // Сбрасываем трансформации
        mobileNavOverlay.style.transform = 'translateY(0)';
        mobileNavOverlay.style.opacity = '1';
    }

    // Закрытие меню по клику на overlay
    mobileNavOverlay.addEventListener('click', function(e) {
        if (e.target === mobileNavOverlay) {
            mobileNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    window.addEventListener('resize', function() {
        // Закрываем меню только при значительном изменении ширины (переход с мобильного на десктоп)
        if (window.innerWidth > 768 && mobileNavOverlay.classList.contains('active')) {
            closeMenu();
        }
    });

    // Закрытие меню при клике на ссылку внутри него
    mobileNavOverlay.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            mobileNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}