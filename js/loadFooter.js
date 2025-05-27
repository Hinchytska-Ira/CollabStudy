fetch('/pages/header.html')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Помилка завантаження хедера: ${response.status}`);
    }
    return response.text();
  })
  .then(data => {
    const placeholder = document.getElementById('header-placeholder');
    if (placeholder) {
      placeholder.innerHTML = data;
    } else {
      console.error('❌ Не знайдено елемент з id="header-placeholder"');
    }
  })
  .catch(error => {
    console.error('❌ Сталася помилка при завантаженні хедера:', error);
  });
