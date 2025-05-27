document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const errorEl = document.getElementById('formError');
  const successEl = document.getElementById('registerSuccess');

  const showError = (msg) => {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
    successEl.style.display = 'none';
  };

  const showSuccess = (msg) => {
    successEl.textContent = msg;
    successEl.style.display = 'block';
    errorEl.style.display = 'none';
  };

  const clearMessages = () => {
    errorEl.style.display = 'none';
    successEl.style.display = 'none';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();

    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const lastname = document.getElementById('lastname').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const passwordRegex = /^[A-Za-z0-9]{8,}$/;

    if (!email || !username || !lastname || !password || !confirmPassword) {
      return showError('❗ Усі поля обовʼязкові!');
    }

    if (password !== confirmPassword) {
      return showError('❗ Паролі не збігаються.');
    }

    if (!passwordRegex.test(password)) {
      return showError('❗ Пароль має бути не менше 8 символів і містити лише англійські літери та цифри.');
    }

    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, username, lastname, password })
      });

      const text = await res.text();

      if (res.ok && text.includes('успішна')) {
        showSuccess('✅ ' + text);
        form.reset();
      } else {
        showError('❌ ' + text);
      }
    } catch (err) {
      showError('⚠️ Сталася помилка: ' + err.message);
    }
  });

  ['email', 'username', 'lastname', 'password', 'confirmPassword'].forEach((id) => {
    document.getElementById(id).addEventListener('input', clearMessages);
  });
});
