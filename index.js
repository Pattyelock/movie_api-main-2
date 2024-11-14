const express = require("express");
const morgan = require("morgan");
const app = express();

// Use morgan middleware to log all requests to the terminal
app.use(morgan("common"));

// Serve static files from the "public" directory
app.use(express.static("public"));

// Sample movie data
const movies = [
  { title: "Inception", director: "Christopher Nolan", year: 2010 },
  { title: "The Matrix", director: "Lana and Lilly Wachowski", year: 1999 },
  // Add more movies as needed
];

// Sample user data
const users = [
  { username: "newUser123", favorites: [] },
  // Add other users here as needed
];

// Root route at '/'
app.get("/", (req, res) => {
  res.send("Welcome to My Movie API!");
});

// Movies route at '/movies' that returns JSON data
app.get("/movies", (req, res) => {
  res.json(movies);
});

// Add a movie to a user's list of favorites
app.post("/users/:username/movies/:movieTitle", (req, res) => {
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

// Remove a movie from a user's list of favorites
app.delete("/users/:username/movies/:movieTitle", (req, res) => {
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

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  res.status(500).send("Something went wrong! Please try again later.");
});

// Start the server
app.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
