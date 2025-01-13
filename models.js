const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  ImagePath: { type: String, default: '/images/default.jpg' },
  Featured: { type: Boolean, default: false },
  Reviews: [
    {
      UserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      Comment: { type: String },
      Rating: { type: Number, min: 1, max: 5 },
      CreatedAt: { type: Date, default: Date.now },
    }
  ],
});

// Define User schema
const userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: {
    type: String,
    required: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address'],
  },
  Birthday: { type: Date },
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

// Hash password
userSchema.statics.hashPassword = (password) => bcrypt.hashSync(password, 10);

// Validate password
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Movie, User };
