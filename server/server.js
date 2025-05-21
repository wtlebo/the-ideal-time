require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conditionsRouter = require('./routes/conditions');
const geocodingRouter = require('./routes/geocoding');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/conditions', conditionsRouter);
app.use('/geocode', geocodingRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
