const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');  // Import the CORS package

dotenv.config();

const app = express();

// Connect to MongoDB
const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/myflix'; // Default to 'myflix' if MONGO_URI is not set
mongoose.connect(dbURI)
  .then(() => console.log('MongoDB connected to', dbURI))
  .catch((err) => console.error('MongoDB connection error:', err));

// Enable CORS
const allowedOrigins = ['http://localhost:3000', 'https://your-heroku-app.herokuapp.com'];
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// Define your routes
const moviesRoute = require('./routes/movies');
app.use('/movies', moviesRoute);

// Set the port to 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
