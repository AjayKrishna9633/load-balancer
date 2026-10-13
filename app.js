const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/loadbalancer')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  password: String
}));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret123', resave: false, saveUninitialized: false }));

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.render('login', { error: 'Please enter name and password' });
  }

  let user = await User.findOne({ name });
  if (!user) {
    // first time login creates the user
    user = await User.create({ name, password });
  } else if (user.password !== password) {
    return res.render('login', { error: 'Wrong password' });
  }

  req.session.name = user.name;
  res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.name) return res.redirect('/login');
  res.render('dashboard', { name: req.session.name });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
