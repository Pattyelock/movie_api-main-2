const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const Models = require("./models.js");

// Initialize Express
const app = express();
app.use(express.json()); // Use Express's built-in JSON parser

// Import models
const Movies = Models.Movie;
const Users = Models.User;

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/myflix")
  .then(() => console.log("Connected to the myflix database"))
  .catch((err) => console.error("Database connection error:", err));

// Import Passport strategies
require("./passport");

// Import authentication logic
let auth = require("./auth")(app);

// Endpoints

// 1. Return a list of ALL movies
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => res.json(movies))
      .catch((err) => res.status(500).send("Error: " + err));
  }
);

// 2. Return data about a single movie by title
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.title })
      .then((movie) =>
        movie ? res.json(movie) : res.status(404).send("Movie not found")
      )
      .catch((err) => res.status(500).send("Error: " + err));
  }
);

// 5. Allow new users to register (excluded from authentication)
app.post("/users", async (req, res) => {
  await Users.create({
    Username: req.body.Username,
    Password: req.body.Password,
    Email: req.body.Email,
    Birthday: req.body.Birthday,
    FavoriteMovies: req.body.FavoriteMovies || [],
  })
    .then((user) => res.status(201).json(user))
    .catch((err) => res.status(500).send("Error: " + err));
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
