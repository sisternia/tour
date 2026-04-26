require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./src/config/db');
const userRoutes = require('./src/routes/users.route');
const guideRoutes = require('./src/routes/guides.route');
const tourRoutes = require('./src/routes/tours.route');

const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/tours', tourRoutes);
app.use(express.static(path.join(__dirname, 'admin')));

app.get('/', (req, res) => { 
  res.redirect('/home/home.html'); 
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});