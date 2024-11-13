const express = require("express");
const morgan = require("morgan");
const app = express();

// Use morgan middleware to log all requests to the terminal
app.use(morgan("common"));

// Serve static files from the "public" directory
app.use(express.static("public"));

// Root route at '/'
app.get("/", (req, res) => {
  res.send("Welcome to My Movie API!");
});

// Movies route at '/movies' that returns JSON data
const movies = [
  { title: "Inception", director: "Christopher Nolan", year: 2010 },
  { title: "The Matrix", director: "Lana and Lilly Wachowski", year: 1999 },
  { title: "The Godfather", director: "Francis Ford Coppola", year: 1972 },
  { title: "The Color Purple", director: "Steven Spielberg", year: 1985 },
  { title: "Black Panther", director: "Ryan Coogler", year: 2018 },
  { title: "Hidden Figures", director: "Theodore Melfi", year: 2016 },
  { title: "Waiting to Exhale", director: "Forest Whitaker", year: 1995 },
  { title: "Love & Basketball", director: "Gina Prince-Bythewood", year: 2000 },
  { title: "Set It Off", director: "F. Gary Gray", year: 1996 },
  { title: "The Shawshank Redemption", director: "Frank Darabont", year: 1994 },
];

app.get("/movies", (req, res) => {
  res.json(movies);
});

// Test error route
app.get("/error", (req, res) => {
  throw new Error("Test error!");
});

// Error-handling middleware
app.use((err, req, res, next) => {
  // Log error details to the terminal
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  // Send a generic error response to the client
  res.status(500).send("Something went wrong! Please try again later.");
});

// Start the server
app.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
