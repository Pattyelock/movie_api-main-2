const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Models = require("./models.js");

// Initialize Express
const app = express();
app.use(bodyParser.json());

// Import models
const Movies = Models.Movie;
const Users = Models.User;

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/myflix", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to the myflix database"))
  .catch((err) => console.error("Database connection error:", err));

// Endpoints

// 1. Return a list of ALL movies
app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => res.json(movies))
    .catch((err) => res.status(500).send("Error: " + err));
});

// 2. Return data about a single movie by title
app.get("/movies/:title", (req, res) => {
  Movies.findOne({ Title: req.params.title })
    .then((movie) => movie ? res.json(movie) : res.status(404).send("Movie not found"))
    .catch((err) => res.status(500).send("Error: " + err));
});

// 3. Return data about a genre by name
app.get("/genres/:name", (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.name })
    .then((movie) => {
      if (movie) {
        res.json(movie.Genre);
      } else {
        res.status(404).send("Genre not found");
      }
    })
    .catch((err) => res.status(500).send("Error: " + err));
});

// 4. Return data about a director by name
app.get("/directors/:name", (req, res) => {
  Movies.findOne({ "Director.Name": req.params.name })
    .then((movie) => {
      if (movie) {
        res.json(movie.Director);
      } else {
        res.status(404).send("Director not found");
      }
    })
    .catch((err) => res.status(500).send("Error: " + err));
});

// 5. Allow new users to register
app.post("/users", (req, res) => {
  Users.create({
    Username: req.body.Username,
    Password: req.body.Password,
    Email: req.body.Email,
    Birthday: req.body.Birthday,
    FavoriteMovies: req.body.FavoriteMovies || [],
  })
    .then((user) => res.status(201).json(user))
    .catch((err) => res.status(500).send("Error: " + err));
});

// 6. Allow users to update their user info
app.put("/users/:username", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }
  )
    .then((updatedUser) => res.json(updatedUser))
    .catch((err) => res.status(500).send("Error: " + err));
});

// 7. Allow users to add a movie to their list of favorites
app.post("/users/:username/movies/:movieId", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.username },
    { $push: { FavoriteMovies: req.params.movieId } },
    { new: true }
  )
    .then((updatedUser) => res.json(updatedUser))
    .catch((err) => res.status(500).send("Error: " + err));
});

// 8. Allow users to remove a movie from their list of favorites
app.delete("/users/:username/movies/:movieId", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.username },
    { $pull: { FavoriteMovies: req.params.movieId } },
    { new: true }
  )
    .then((updatedUser) => res.json(updatedUser))
    .catch((err) => res.status(500).send("Error: " + err));
});

// 9. Allow existing users to deregister
app.delete("/users/:username", (req, res) => {
  Users.findOneAndRemove({ Username: req.params.username })
    .then((user) => {
      if (user) {
        res.status(200).send(`${req.params.username} was deleted.`);
      } else {
        res.status(404).send("User not found");
      }
    })
    .catch((err) => res.status(500).send("Error: " + err));
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
