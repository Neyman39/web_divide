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
    
    // Закрытие меню по клику на overlay
    mobileNavOverlay.addEventListener('click', function(e) {
        if (e.target === mobileNavOverlay) {
            mobileNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
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