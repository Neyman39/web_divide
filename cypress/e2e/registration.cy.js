// // cypress/e2e/registration.cy.js
// describe('Регистрация пользователя', () => {
//   // Генерируем уникальные данные для каждого теста
//   const generateUniqueUser = () => {
//     const timestamp = Date.now()
//     const random = Math.floor(Math.random() * 1000)
//     return {
//       login: `testuser_${timestamp}_${random}`,
//       email: `test_${timestamp}_${random}@test.com`,
//       surname: `TestSurname${random}`,
//       name: `TestName${random}`,
//       password: 'Test123!'
//     }
//   }

//   beforeEach(() => {
//     // Очистка тестовых данных перед каждым тестом (если есть API)
//     cy.request('POST', '/api/test/cleanup', {
//       testUserPrefix: 'testuser_'
//     }).then(response => {
//       expect(response.status).to.eq(200)
//     })
//   })

//   it('успешная регистрация с уникальными данными', () => {
//     const user = generateUniqueUser()
    
//     cy.visit('http://localhost:5000/')
//     cy.get('#authStatus a').click()
//     cy.get('#loginForm div.forbutt').click()
    
//     cy.get('[name="login"]').type(user.login)
//     cy.get('[name="email"]').type(user.email)
//     cy.get('[name="surname"]').type(user.surname)
//     cy.get('[name="name"]').type(user.name)
//     cy.get('[name="password"]').type(user.password)
//     cy.get('[name="password2"]').type(user.password)
    
//     cy.get('#registrationForm button').click()
    
//     // Проверка успешной регистрации
//     cy.get('.success-message').should('be.visible')
//     cy.get('#authStatus').should('have.text', `${user.name} ${user.surname}`)
//   })
// })

// cypress/e2e/registration-simple.cy.js

describe('Регистрация пользователя', () => {
  
  it('успешная регистрация нового пользователя', () => {
    // 1. Генерируем уникальные данные для теста
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const testUser = {
      login: `testuser_${timestamp}_${random}`,
      email: `test_${timestamp}_${random}@test.com`,
      surname: `Тестов`,
      name: `Польтер${random}`,
      password: '123456'
    };
    
    cy.log(`🔄 Тестируем регистрацию: ${testUser.email}`);
    
    // 2. Переходим на сайт
    cy.visit('http://localhost:5000/');
    
    // 3. Проверяем, что видим кнопку "Войти" (не авторизованы)
    cy.get('#authStatus a')
      .should('contain', 'Войти')
      .click();
    
    // 4. Переходим к форме регистрации
    cy.get('#loginForm div.forbutt').click();
    
    // 5. Заполняем форму регистрации
    cy.get('[name="login"]').type(testUser.login);
    cy.get('[name="email"]').type(testUser.email);
    cy.get('[name="surname"]').type(testUser.surname);
    cy.get('[name="name"]').type(testUser.name);
    cy.get('[name="password"]').type(testUser.password);
    cy.get('[name="password2"]').type(testUser.password);
    
    // 6. Отправляем форму
    cy.get('#registrationForm button').click();
    
    // 7. Ждем завершения регистрации (редирект, анимация)
    cy.wait(9000);
  
    // 9. Проверяем, что имя пользователя отображается
    cy.get('#authStatus')
      .should('have.text', `${testUser.name} ${testUser.surname}`);
    
    // 10. ✅ ВСЁ! Тест завершен успешно!
    
    // 11. ОПЦИОНАЛЬНО: Очищаем за собой
    // Если хотите удалить пользователя после теста:
    const encodedEmail = encodeURIComponent(testUser.email);
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/users/email/${encodedEmail}`,
      failOnStatusCode: false // Не падать если пользователь не найден
    }).then(response => {
      if (response.status === 200) {
        cy.log(`✅ Тестовый пользователь удален: ${testUser.email}`);
      }
    });
  });
  
  it('регистрация с существующим email (проверка ошибки)', () => {
    // Сначала создаем пользователя через API
    // const existingUser = {
    //   login: `existing_${Date.now()}`,
    //   email: `existing_${Date.now()}@test.com`,
    //   surname: 'Существующий',
    //   name: 'Пользователь',
    //   password: '123456'
    // };
    
    // // Регистрируем первого пользователя
    // cy.request({
    //   method: 'POST',
    //   url: 'http://localhost:5000/register',
    //   body: existingUser,
    //   failOnStatusCode: false
    // });
    
    // Теперь пытаемся зарегистрировать второго с тем же email
    cy.visit('http://localhost:5000/');
    cy.get('#authStatus a').click();
    cy.get('#loginForm div.forbutt').click();
    
    cy.get('[name="login"]').type('другой_логин');
    cy.get('[name="email"]').type('qwe@mail.com');
    cy.get('[name="surname"]').type('Другой');
    cy.get('[name="name"]').type('Пользователь');
    cy.get('[name="password"]').type('123456');
    cy.get('[name="password2"]').type('123456');
    
    cy.get('#registrationForm button').click();
    
    // Проверяем сообщение об ошибке
    cy.wait(2000);
    cy.contains('Пользователь с таким email уже зарегистрирован').should('exist');
    
    // // Удаляем тестового пользователя
    // const encodedEmail = encodeURIComponent(existingUser.email);
    // cy.request({
    //   method: 'DELETE',
    //   url: `http://localhost:5000/users/email/${encodedEmail}`,
    //   failOnStatusCode: false
    // });
  });

  it('регистрация с существующим логином (проверка ошибки)', () => {
    
    cy.visit('http://localhost:5000/');
    cy.get('#authStatus a').click();
    cy.get('#loginForm div.forbutt').click();
    
    cy.get('[name="login"]').type('qwe');
    cy.get('[name="email"]').type('qwe123@mail.com');
    cy.get('[name="surname"]').type('Другой');
    cy.get('[name="name"]').type('Пользователь');
    cy.get('[name="password"]').type('123456');
    cy.get('[name="password2"]').type('123456');
    
    cy.get('#registrationForm button').click();
    
    // Проверяем сообщение об ошибке
    cy.wait(500);
    cy.contains('Пользователь с таким логином уже существует').should('exist');
    
  });

  it('регистрация с некоректным email (проверка ошибки)', () => {
    
    cy.visit('http://localhost:5000/');
    cy.get('#authStatus a').click();
    cy.get('#loginForm div.forbutt').click();
    
    cy.get('[name="login"]').type('qwe123');
    cy.get('[name="email"]').type('qwe123@mailcom');
    cy.get('[name="surname"]').type('Другой');
    cy.get('[name="name"]').type('Пользователь');
    cy.get('[name="password"]').type('123456');
    cy.get('[name="password2"]').type('123456');
    
    cy.get('#registrationForm button').click();
    
    // Проверяем сообщение об ошибке
    cy.wait(500);
    cy.contains('Некорректный формат email').should('exist');
    
  });

  it('регистрация не все поля заполнены', () => {
    
    cy.visit('http://localhost:5000/');
    cy.get('#authStatus a').click();
    cy.get('#loginForm div.forbutt').click();
    
    cy.get('[name="login"]').type('Asd_123');
    cy.get('[name="email"]').type('asd_123@mail.com');
    cy.get('[name="surname"]').type('Другой');
    cy.get('[name="password"]').type('123456');
    cy.get('[name="password2"]').type('123456');
    
    cy.get('#registrationForm button').click();
    
    // Проверяем сообщение об ошибке
    cy.wait(500);
    cy.contains('Все поля обязательны для заполнения').should('exist');
    
  });

  it('регистрация: пароли не совпадают', () => {
    
    cy.visit('http://localhost:5000/');
    cy.get('#authStatus a').click();
    cy.get('#loginForm div.forbutt').click();
    
    cy.get('[name="login"]').type('vivo_123');
    cy.get('[name="email"]').type('g.vivo_123@mail.ru');
    cy.get('[name="surname"]').type('vivov');
    cy.get('[name="name"]').type('tert');
    cy.get('[name="password"]').type('123456');
    cy.get('[name="password2"]').type('12345');
    
    cy.get('#registrationForm button').click();
    
    // Проверяем сообщение об ошибке
    cy.wait(500);
    cy.contains('Пароли не совпадают').should('exist');
    
  });
});