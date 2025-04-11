// loadFooter.js

// Функція для завантаження футера на сторінку
function loadFooter() {
    fetch('footer.html') // Завантажуємо футер з файлу footer.html
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('beforeend', data); // Додаємо футер в кінець body
        })
        .catch(error => console.error('Помилка при завантаженні футера:', error));
}

// Викликаємо функцію при завантаженні сторінки
window.addEventListener('load', loadFooter);
