// check_authorization - функция проверки авторизации и отображения пользователя
async function checkAuthAndDisplayUser() {
      
    const authStatusDiv = document.getElementById('authStatus');
  
  try {
    const response = await fetch('http://localhost:5000/check-auth', {
      headers: {
        'Authorization': localStorage.getItem('authToken') || ''
      }
    });

    if (response.ok) {
      const { user } = await response.json();
      
      // Отображаем информацию о пользователе
      authStatusDiv.innerHTML = `${user.name} ${user.surname}`;

        document.getElementById('account').href = 'User_Account.html';
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