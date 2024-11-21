// Import Mongoose
const mongoose = require('mongoose');

// Define the "Movies" Schema
let movieSchema = mongoose.Schema({
  Title: { 
    type: String, 
    required: true,
    unique: true, // Ensures each movie title is unique
  },
  Description: { 
    type: String, 
    required: true,
  },
  Genre: {
    Name: { type: String, required: true },
    Description: { type: String },
  },
  Director: {
    Name: { type: String, required: true },
    Bio: { type: String },
  },
  Actors: {
    type: [String],
    validate: {
      validator: function (v) {
        return v && v.length > 0; // Ensures at least one actor is present
      },
      message: 'At least one actor is required.'
    },
  },
  ImagePath: { type: String },
  Featured: { type: Boolean, default: false }, // Default to false if not specified
});

// Define the "Users" Schema
let userSchema = mongoose.Schema({
  Username: { 
    type: String, 
    required: true, 
    unique: true, // Ensures each username is unique
    minlength: [5, 'Username must be at least 5 characters long'], // Minimum length for username
  },
  Password: { 
    type: String, 
    required: true,
    minlength: [6, 'Password must be at least 6 characters long'], // Minimum length for password
  },
  Email: { 
    type: String, 
    required: true,
    unique: true, // Ensures email is unique
    match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please fill a valid email address'], // Email format validation
  },
  Birthday: { 
    type: Date, 
    required: true, 
  },
  FavoriteMovies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Movie' 
  }],
});

// Create Models from the Schemas
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

// Export Models
module.exports.Movie = Movie;
module.exports.User = User;
