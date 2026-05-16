// Загрузка страницы, терминал с приветсвием
  
const terminal1 = document.getElementById('terminal1');
const cursor = document.querySelector('.cursor');

let lineIndex = 0;
let charIndex = 0;
let currentLine = '';

function typeLine() {
    const userata = JSON.parse(localStorage.getItem('userData'));
    const lines = [
"> INITIALIZING KEYDIVIDE v2.1...",
"  [OK] Memory check",
"  [OK] Keyboard driver loaded",
"  [INFO] Hot-swap module: active",
"  [INFO] RGB lighting: disabled",
"> Scanning firmware...",
" ",
"　　　　　／フ---/フ",
"　　　　　| 　_　 _|",
"　 　　　／`ミ _x 彡",
"　　 　 /　　　 　 |",
"　　　 /　 ヽ　　 ﾉ",
"　／￣|　　 |　|　|",
"　| (￣ヽ＿_ヽ_)_)",
"　＼二つ",
"> SYSTEM READY. WELCOME, " + userata.name.toUpperCase() + " " + userata.surname.toUpperCase() + "."
];

    document.getElementById('terminal-screen').style.display = 'flex';
      if (lineIndex >= lines.length) {
        // Завершаем анимацию
        setTimeout(() => {
          document.getElementById('terminal-screen').style.display = 'none'; // none
          const main = document.getElementById('main-content');
          main.style.display = 'block'; // block
          setTimeout(() => {
              main.style.opacity = '1'; // 1
          }, 100);
        }, 500);
        
        window.location.href = 'Главная.html';
        return;
    }

    const currentLine = lines[lineIndex];

    // Формируем текущий текст: уже напечатанное + новый символ
    const printed = currentLine.substring(0, charIndex + 1);

    // Очищаем терминал и вставляем всё с новым курсором
    terminal.innerHTML = lines
    .slice(0, lineIndex) // Все предыдущие строки
    .map(line => line + '<br>')
    .join('') +
    printed + // Текущая строка — до текущего символа
    '<span class="cursor">█</span>'; // Курсор в конце

    charIndex++;

    if (charIndex === currentLine.length) {
        charIndex = 0;
        lineIndex++;
        if (lineIndex == 6 || lineIndex == 16) {
            setTimeout(typeLine, 1000);
        }
        else setTimeout(typeLine, Math.random() * 200 + 50); // Задержка между строками
    } 
    else if (lineIndex < 7 || lineIndex == 15) {
        setTimeout(typeLine, 10 + Math.random() * 10); // Быстрая печать
    }
    else setTimeout(typeLine, 5 + Math.random() * 5); // Быстрая печать
}

// Запуск анимации при загрузке
  // document.addEventListener('DOMContentLoaded', async () => {
  //   await typeLine();
  // });