// Import dependencies
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

// Utility Functions
const isValidString = (str) => typeof str === "string" && str.trim().length > 0;

// Endpoints

// 1. Return a list of ALL movies
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movies = await Movies.find();
      res.json(movies);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

// 2. Return data about a single movie by title
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findOne({ Title: req.params.title });
      if (!movie) {
        return res.status(404).send("Movie not found");
      }
      res.json(movie);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

// 3. Return data about a genre by name
app.get(
  "/genres/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findOne({ "Genre.Name": req.params.name });
      if (!movie) {
        return res.status(404).send("Genre not found");
      }
      res.json(movie.Genre);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

// 4. Return data about a director by name
app.get(
  "/directors/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findOne({ "Director.Name": req.params.name });
      if (!movie) {
        return res.status(404).send("Director not found");
      }
      res.json(movie.Director);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

// 5. Allow new users to register (with validation)
app.post("/users", async (req, res) => {
  const { Username, Password, Email, Birthday } = req.body;

  if (!isValidString(Username) || !isValidString(Password)) {
    return res.status(400).send("Invalid username or password");
  }

  try {
    const userExists = await Users.findOne({ Username });
    if (userExists) {
      return res.status(400).send("Username already exists");
    }

    const newUser = await Users.create({
      Username,
      Password, // Hashing would typically be applied here
      Email,
      Birthday,
      FavoriteMovies: [],
    });

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
});

// 6. Allow users to update their user info
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { Username, Password, Email, Birthday } = req.body;

    if (!isValidString(Username) || !isValidString(Password)) {
      return res.status(400).send("Invalid username or password");
    }

    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.username },
        { $set: { Username, Password, Email, Birthday } },
        { new: true }
      );

      res.json(updatedUser);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

// 7. Allow users to add a movie to their list of favorites
app.post(
  "/users/:username/movies/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findById(req.params.movieId);
      if (!movie) {
        return res.status(404).send("Movie not found");
      }

      const user = await Users.findOneAndUpdate(
        {
          Username: req.params.username,
          FavoriteMovies: { $ne: req.params.movieId },
        },
        { $push: { FavoriteMovies: req.params.movieId } },
        { new: true }
      );

      if (!user) {
        return res
          .status(400)
          .send("Movie already in favorites or user not found");
      }

      res.json(user);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

// 8. Allow users to remove a movie from their list of favorites
app.delete(
  "/users/:username/movies/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await Users.findOneAndUpdate(
        { Username: req.params.username },
        { $pull: { FavoriteMovies: req.params.movieId } },
        { new: true }
      );

      if (!user) {
        return res.status(404).send("User not found");
      }

      res.json(user);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

// 9. Allow existing users to deregister
app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await Users.findOneAndDelete({
        Username: req.params.username,
      });
      if (!user) {
        return res.status(404).send("User not found");
      }

      res.status(200).send(`${req.params.username} was deleted.`);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
});
