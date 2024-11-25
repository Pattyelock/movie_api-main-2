const mongoose = require('mongoose');

// Define Movie schema
const movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: { type: String, required: true },
    Description: { type: String },
  },
  Director: {
    Name: { type: String, required: true },
    Bio: { type: String },
    BirthYear: { type: Number },
    DeathYear: { type: Number },
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean,
});

// Define User schema
const userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: { type: Date },
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

// Create Models
const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);

// Export Models
module.exports = { Movie, User };
