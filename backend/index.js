const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// backend pozwala na zapytania z np. frontendu
app.use(cors());

// parsowania json w zapytaniach
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

mongoose.connect(config.mongoURI)
.then(() => {
  console.log('Połączono z MongoDB');
})
.catch(err => {
  console.error('Błąd połączenia z MongoDB:', err);
  process.exit(1);
});

app.use('/api/auth', authRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
