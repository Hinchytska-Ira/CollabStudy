// server.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const helmet = require('helmet');
const fs = require('fs');

const app = express();
const PORT = 3000;
const SALT_ROUNDS = 10;

// Middleware
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));

// Статичні файли
app.use(express.static(path.join(__dirname, 'pages')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(session({
  secret: 'supersecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Підключення до БД
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'user_platform'
});

db.connect((err) => {
  if (err) {
    console.error('❌ DB Connection Error:', err);
  } else {
    console.log('✅ Connected to MySQL');
  }
});

// Header
app.get('/components/header', (req, res) => {
  const filePath = path.join(__dirname, 'pages', 'header.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(404).send('Header not found');
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
  });
});

// Pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'pages/index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'pages/login.html')));
app.get('/registration', (req, res) => res.sendFile(path.join(__dirname, 'pages/registration.html')));
app.get('/chat', (req, res) => {
  if (req.session.user) return res.sendFile(path.join(__dirname, 'pages/chat.html'));
  res.redirect('/login');
});

// Реєстрація
app.post('/register', async (req, res) => {
  const { email, username, lastname, password } = req.body;

  if (!email || !username || !lastname || !password) {
    return res.status(400).send('Усі поля обовʼязкові!');
  }

  try {
    // Перевірка: чи існує email
    const [emailRows] = await db.promise().query('SELECT 1 FROM users WHERE email = ? LIMIT 1', [email]);
    if (emailRows.length > 0) {
      return res.status(409).send('Така пошта вже зареєстрована.');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await db.promise().query(
      'INSERT INTO users (email, username, lastname, password_hash) VALUES (?, ?, ?, ?)',
      [email, username, lastname, hashedPassword]
    );

    return res.status(201).send('Реєстрація успішна!');
  } catch (err) {
    console.error('❌ Registration Error:', err.message);
    return res.status(500).send('Внутрішня помилка сервера.');
  }
});

// Авторизація
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Усі поля обовʼязкові!');
  }

  try {
    const [[user]] = await db.promise().query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);

    if (!user) {
      return res.status(401).send('Невірна пошта або пароль.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).send('Невірна пошта або пароль.');
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username
    };

    return res.redirect('/');
  } catch (err) {
    console.error('❌ Login Error:', err.message);
    return res.status(500).send('Помилка входу.');
  }
});

// Вихід
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено: http://localhost:${PORT}`);
});
