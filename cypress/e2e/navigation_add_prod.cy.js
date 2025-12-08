describe('Проверка всей навигации на сайте', () => {
  it('navigation', function() {
      cy.visit('http://localhost:5000/')
      
      // Проверяем существование всех элементов
          const links = [
      '#nav_header a[href="Главная.html#keyboards"]',
      '#nav_header a[href="Главная.html#services"]',
      '#nav_header a[href="Главная.html#aboutus"]',
      '#nav_header a.header__logo',
      'div.welcome-banner__buttons a[href="#keyboards"]',
      'div.welcome-banner__buttons a[href="#services"]',
      'div.butt1 a[href="#keyboards"]',
      'div.butt1 a[href="#services"]',
      '#footer a[href="#keyboards"]',
      '#footer a[href="#services"]',
      '#footer a[href="#aboutus"]',
      '#authStatus a',
      '#account img',
      'a[href="Главная.html"]',
      '#nav_header a[href="Корзина.html"] img',
      'header.header a.header__logo'
          ]
      
          links.forEach(selector => {
      cy.get(selector).should('exist').and('be.visible')
          })
      
      cy.get('#nav_header a[href="Главная.html#keyboards"]').click();
      cy.get('#nav_header a[href="Главная.html#services"]').click();
      cy.get('#nav_header a[href="Главная.html#aboutus"]').click();
      cy.get('#nav_header a.header__logo').click();
      cy.get('div.welcome-banner__buttons a[href="#keyboards"]').click();
      cy.get('div.welcome-banner__buttons a[href="#services"]').click();
      cy.get('div.butt1 a[href="#keyboards"]').click();
      cy.get('div.butt1 a[href="#services"]').click();
      cy.get('#footer a[href="#keyboards"]').click();
      cy.get('#footer a[href="#services"]').click();
      cy.get('#footer a[href="#aboutus"]').click();
      cy.get('#authStatus a').click();
      cy.get('span.red').click();
      cy.get('#account img').click();
      cy.get('a[href="Главная.html"]').click();
      cy.get('#nav_header a[href="Корзина.html"] img').click();
      cy.get('header.header a.header__logo').click();
      cy.get('a[href="product.html?id=1"] h3.product-card__name').should('have.text', 'CacaoSplit Ortomini Black');
      cy.get('a[href="product.html?id=2"] h3.product-card__name').should('have.text', 'CacaoSplit Ortomini52');
      cy.get('a[href="product.html?id=3"] h3.product-card__name').should('have.text', 'CacaoSplit Founder64');
  });

  it('попытка добавление товара в корзину', function() {

    const alertStub = cy.stub();
      cy.on('window:alert', alertStub);

      cy.visit('http://localhost:5000/')
      cy.get('img[alt="CacaoSplit Ortomini Black"]').click();
      cy.get('#specificationsCode span:nth-child(8)').should('have.text', '"Akko V3 Cream Yellow (линейные 50г.)"');
      cy.get('#switchesContainer button[data-config="1"] p.switch__name').should('have.text', 'Akko V3 Cream Yellow');
      cy.get('#productPrice').should('have.text', '9030 ₽');
      cy.get('#switchesContainer button[data-config="3"] div.swbox').click();
      cy.get('#productPrice').should('have.text', '9066 ₽');
      cy.get('#addToCartBtn p').click()
        .then(() => {
            // Проверяем что alert был вызван с правильным текстом
            expect(alertStub).to.be.calledWith('Произошла ошибка при добавлении в корзину');
            cy.log('✅ Alert был показан с правильным текстом');
        });
  });

  it('удачное добавление товара', function() {
      cy.visit('http://localhost:5000/')
      cy.get('#authStatus a').click();
      cy.get('[name="login"]').click();
      cy.get('[name="login"]').type('qwe');
      cy.get('[name="password"]').click();
      cy.get('[name="password"]').type('123');
      cy.get('#loginForm button').click();
      cy.wait(9000);
      cy.get('img[alt="CacaoSplit Ortomini Black"]').click();
      cy.get('#addToCartBtn p').click();
      cy.get('#nav_header a[href="Корзина.html"] img').click();
      cy.get('#cartContainer div:nth-child(1) > strong').should('have.text', 'CacaoSplit Ortomini Black');
      cy.get('#orderBtn').click();
      cy.get('#ordersSection td:nth-child(1)').should('have.text', 'CacaoSplit Ortomini Black');
  });
});
