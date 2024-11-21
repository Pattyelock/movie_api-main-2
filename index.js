const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const Models = require("./models.js");

const app = express();

const Movies = Models.Movie;
const Users = Models.User;

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/myflix", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB:", err));

// Use morgan middleware to log all requests to the terminal
app.use(morgan("common"));
app.use(express.json()); // Parse JSON bodies

// Serve static files from the "public" directory
app.use(express.static("public"));

// Root route at '/'
app.get("/", (req, res) => {
  res.send("Welcome to My Movie API!");
});

// Retrieve a list of all movies
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movies.find();
    res.json(movies);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
});

// Retrieve details of a movie by title
app.get("/movies/:title", async (req, res) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.title });
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).send("Movie not found.");
    }
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
});

// Retrieve genre details by name
app.get("/genres/:name", async (req, res) => {
  try {
    const genre = await Movies.findOne({ "Genre.Name": req.params.name });
    if (genre) {
      res.json(genre.Genre);
    } else {
      res.status(404).send("Genre not found.");
    }
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
});

// Retrieve director details by name
app.get("/directors/:name", async (req, res) => {
  try {
    const director = await Movies.findOne({ "Director.Name": req.params.name });
    if (director) {
      res.json(director.Director);
    } else {
      res.status(404).send("Director not found.");
    }
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
});

// Register a new user
app.post("/users", async (req, res) => {
  try {
    const existingUser = await Users.findOne({ Username: req.body.Username });
    if (existingUser) {
      return res.status(400).send("Username already exists.");
    }

    const newUser = await Users.create({
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday,
    });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
});

// Update user information
app.put("/users/:username", async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $set: req.body },
      { new: true }
    );
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).send("User not found.");
    }
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
});

// Add a movie to a user's favorites
app.post("/users/:username/favorites/:movieId", async (req, res) => {
  try {
    const user = await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $addToSet: { FavoriteMovies: req.params.movieId } },
      { new: true }
    );
    if (user) {
      res.json(user);
    } else {
      res.status(404).send("User not found.");
    }
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
});

// Remove a movie from a user's favorites
app.delete("/users/:username/favorites/:movieId", async (req, res) => {
  try {
    const user = await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $pull: { FavoriteMovies: req.params.movieId } },
      { new: true }
    );
    if (user) {
      res.json(user);
    } else {
      res.status(404).send("User not found.");
    }
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
});

// Deregister user
app.delete("/users/:username", async (req, res) => {
  try {
    const deletedUser = await Users.findOneAndRemove({ Username: req.params.username });
    if (deletedUser) {
      res.send(`User ${req.params.username} deregistered.`);
    } else {
      res.status(404).send("User not found.");
    }
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).send("Something went wrong! Please try again later.");
});

// Start the server
app.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
