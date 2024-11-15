const express = require("express");
const morgan = require("morgan");
const app = express();

// Use morgan middleware to log all requests to the terminal
app.use(morgan("common"));
app.use(express.json()); // Parse JSON bodies

// Serve static files from the "public" directory
app.use(express.static("public"));

// Sample data
const movies = [
  { title: "Inception", director: "Christopher Nolan", genre: "Sci-Fi", year: 2010 },
  { title: "The Matrix", director: "Lana and Lilly Wachowski", genre: "Action", year: 1999 },
  // Add more movies as needed
];

const users = [
  { username: "newUser123", favorites: [] },
  // Add other users here as needed
];

// Root route at '/'
app.get("/", (req, res) => {
  res.send("Welcome to My Movie API!");
});

// Retrieve a list of all movies
app.get("/movies", (req, res) => {
  res.json(movies);
});

// Retrieve details of a movie by title
app.get("/movies/:title", (req, res) => {
  const movie = movies.find(m => m.title === req.params.title);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).send("Movie not found.");
  }
});

// Retrieve genre details by name
app.get("/genres/:name", (req, res) => {
  const genre = movies.find(m => m.genre.toLowerCase() === req.params.name.toLowerCase());
  if (genre) {
    res.json({ genre: genre.genre, movies: movies.filter(m => m.genre === genre.genre) });
  } else {
    res.status(404).send("Genre not found.");
  }
});

// Retrieve director details by name
app.get("/directors/:name", (req, res) => {
  const director = movies.find(m => m.director.toLowerCase() === req.params.name.toLowerCase());
  if (director) {
    res.json({ director: director.director, movies: movies.filter(m => m.director === director.director) });
  } else {
    res.status(404).send("Director not found.");
  }
});

// Register a new user
app.post("/users", (req, res) => {
  const newUser = { username: req.body.username, favorites: [] };
  users.push(newUser);
  res.status(201).send(`User ${newUser.username} registered successfully.`);
});

// Update user information
app.put("/users/:username", (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  if (user) {
    user.username = req.body.username || user.username;
    res.send(`User ${user.username} information updated.`);
  } else {
    res.status(404).send("User not found.");
  }
});

// Add a movie to a user's favorites
app.post("/users/:username/favorites/:movieTitle", (req, res) => {
  const { username, movieTitle } = req.params;
  const user = users.find(u => u.username === username);
  if (user) {
    if (!user.favorites.includes(movieTitle)) {
      user.favorites.push(movieTitle);
      res.send(`${movieTitle} has been added to ${username}'s favorites.`);
    } else {
      res.send(`${movieTitle} is already in ${username}'s favorites.`);
    }
  } else {
    res.status(404).send("User not found.");
  }
});

// Remove a movie from a user's favorites
app.delete("/users/:username/favorites/:movieTitle", (req, res) => {
  const { username, movieTitle } = req.params;
  const user = users.find(u => u.username === username);
  if (user) {
    const movieIndex = user.favorites.indexOf(movieTitle);
    if (movieIndex > -1) {
      user.favorites.splice(movieIndex, 1);
      res.send(`${movieTitle} has been removed from ${username}'s favorites.`);
    } else {
      res.send(`${movieTitle} was not found in ${username}'s favorites.`);
    }
  } else {
    res.status(404).send("User not found.");
  }
});

// Deregister user
app.delete("/users/:username", (req, res) => {
  const userIndex = users.findIndex(u => u.username === req.params.username);
  if (userIndex > -1) {
    users.splice(userIndex, 1);
    res.send(`User ${req.params.username} deregistered.`);
  } else {
    res.status(404).send("User not found.");
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
