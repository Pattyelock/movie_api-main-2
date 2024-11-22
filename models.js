const mongoose = require("mongoose");

// Define the Movie Schema
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true }, // Movie title (required)
  Description: { type: String, required: true }, // Movie description (required)
  Genre: {
    // Genre as a nested object
    Name: String, // Genre name
    Description: String, // Genre description
  },
  Director: {
    // Director as a nested object
    Name: String, // Director's name
    Bio: String, // Director's biography
  },
  Actors: [String], // Array of actor names
  ImagePath: String, // Path to the movie's image
  Featured: Boolean, // Boolean to indicate if the movie is featured
});

// Define the User Schema
let userSchema = mongoose.Schema({
  Username: { type: String, required: true }, // User's username (required)
  Password: { type: String, required: true }, // User's password (required)
  Email: { type: String, required: true }, // User's email (required)
  Birthday: Date, // User's birthday
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }], // Array of references to Movie documents
});

// Create Models
let Movie = mongoose.model("Movie", movieSchema); // Creates the "movies" collection
let User = mongoose.model("User", userSchema); // Creates the "users" collection

// Export Models
module.exports.Movie = Movie; // Makes the Movie model available for import
module.exports.User = User; // Makes the User model available for import
