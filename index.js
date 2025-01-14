const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Check for required environment variables
if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI not set in environment variables.');
  process.exit(1);
}

// Connect to MongoDB
const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/myflix';
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected to', dbURI))
  .catch((err) => console.error('MongoDB connection error:', err));

// Enable CORS
const allowedOrigins = ['http://localhost:3000', 'https://myflix-app.herokuapp.com'];
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Middleware to parse JSON
app.use(express.json());

// Secret key for JWT
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

// Public route to generate token
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  // Generate a token (for simplicity, no password check here)
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// Protected routes
const moviesRoute = require('./routes/movies');
app.use('/movies', authenticateToken, moviesRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Set the port to 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
