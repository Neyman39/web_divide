// функция проверки авторизации и отображения пользователя
async function checkAuthAndDisplayUser() {
  try {
    const response = await fetch('/check-auth', {
      headers: {
        'Authorization': localStorage.getItem('authToken') || ''
      }
    });

    const data = await response.json();

    if (response.ok && data.isAuthenticated) {
      // const { user } = await response.json();
      const isMobile = window.innerWidth <= 768;
      
      // Отображаем информацию о пользователе
      if (isMobile) {
        const authStatusDiv_phone = document.getElementById('authStatus-phone');
        authStatusDiv_phone.innerHTML = `${data.user.name} ${data.user.surname}`;
        document.getElementById('account-phone').href = 'User_Account.html';
      }
      else {
        const authStatusDiv = document.getElementById('authStatus');
        authStatusDiv.innerHTML = `${data.user.name} ${data.user.surname}`;
        document.getElementById('account').href = 'User_Account.html';
      }
    } else {
      // Пользователь не авторизован
      showAuthLinks();
    }
  } catch (error) {
    console.error('Ошибка проверки авторизации:', error);
    showAuthLinks();
  }
}

// Функция для отображения ссылок на вход/регистрацию
function showAuthLinks() {
  const authStatusDiv = document.getElementById('authStatus');
  authStatusDiv.innerHTML = `
    <a href="Авторизация.html" style="margin-right: 10px;">Войти</a>`;
}