describe('Проверка авторизации', () => {
  it('неверный пароль', function() {
  cy.visit('http://localhost:5000/')
  cy.get('#authStatus a').click();
  cy.get('[name="login"]').click();
  cy.get('[name="login"]').type('qwe');
  cy.get('[name="password"]').click();
  cy.get('[name="password"]').type('1234');
  cy.get('#loginForm button').click();
  cy.get('#errorMessage').should('have.text', 'Неверный логин или пароль');
  
});

it('несуществующий логин', function() {
  cy.visit('http://localhost:5000/')
  cy.get('#authStatus a').click();
  cy.get('[name="login"]').click();
  cy.get('[name="login"]').type('test');
  cy.get('[name="password"]').click();
  cy.get('[name="password"]').type('123');
  cy.get('#loginForm button').click();
  cy.get('#errorMessage').should('have.text', 'Неверный логин или пароль');
  
});

  it('успешная авторизация', function() {
    cy.visit('http://localhost:5000/')
    cy.get('#authStatus a').click();
    cy.get('[name="login"]').click();
    cy.get('[name="login"]').type('qwe');
    cy.get('[name="password"]').click();
    cy.get('[name="password"]').type('123');
    cy.get('#loginForm button').click();
    cy.wait(9000);
    cy.get('#authStatus').should('have.text', 'James Cameron');
    cy.get('#account img').click();
    cy.get('#username').should('have.id', 'username');
    cy.get('#logoutBtn').click({force: true});
    cy.get('#authStatus a').should('have.text', 'Войти');
  });
});