  function isValidEmail(email) {
    // Простое, но достаточно надёжное регулярное выражение для email
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
      
  document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const login = document.getElementById('login').value.trim();
    const email = document.getElementById('email').value.trim();
    const surname = document.getElementById('surname').value.trim();
    const name = document.getElementById('name').value.trim();
    const password = document.getElementById('password').value.trim();
    const password2 = document.getElementById('password2').value.trim();

    const messageEl = document.getElementById('message');

    if (!isValidEmail(email)) {
      messageEl.textContent = 'Некорректный формат email';
      messageEl.style.color = 'red';
      return;
    }
  
    if (password !== password2) {
      messageEl.textContent = 'Пароли не совпадают';
      messageEl.style.color = 'red';
      return;
    }
  
    try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            login,
            email,
            surname,
            name,
            password
          }),
        });

        const data = await response.json();

        // registration.js - заменяем блок успешной регистрации

        if (response.ok) {
        
          // Токены теперь в httpOnly cookie, не сохраняем в localStorage!
          // Просто сохраняем данные пользователя для отображения
          localStorage.setItem('userData', JSON.stringify(data.user));
        
          // Показываем сообщение
          messageEl.textContent = 'Регистрация успешна!';
          messageEl.style.color = 'green';
        
          // Перенаправление через небольшую задержку
          setTimeout(() => {
            typeLine();
          }, 1500);
        } 
        else {
          messageEl.textContent = data.error || 'Ошибка регистрации';
          messageEl.style.color = 'red';
        }
    } 
    catch (error) {
      console.error('Ошибка:', error);
      console.error('Тип ошибки:', error.name);
      console.error('Сообщение:', error.message);
      document.getElementById('message').textContent = 'Ошибка соединения с сервером: ' + error.message;
      document.getElementById('message').style.color = 'red';
    }
    });