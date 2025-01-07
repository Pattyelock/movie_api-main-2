const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const Models = require("./models.js");
const cors = require("cors");

// Initialize Express
const app = express();
app.use(express.json()); // Use Express's built-in JSON parser

// Import models
const Movies = Models.Movie;
const Users = Models.User;

// Connect to MongoDB
const dbURI = process.env.MONGO_URI || "mongodb://localhost:27017/myflix";
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected to", dbURI))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());

// Import Passport strategies
require("./passport");

// Import authentication logic
let auth = require("./auth")(app);

// Endpoints

// 1. Return a list of ALL movies
app.get("/movies", async (req, res) => {
  await Movies.find()
    .then((movies) => res.json(movies))
    .catch((err) => res.status(500).send("Error: " + err));
});

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

// 3. Return data about a genre by name
app.get(
  "/genres/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "Genre.Name": req.params.name })
      .then((movie) =>
        movie ? res.json(movie.Genre) : res.status(404).send("Genre not found")
      )
      .catch((err) => res.status(500).send("Error: " + err));
  }
);

// 4. Return data about a director by name
app.get(
  "/directors/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "Director.Name": req.params.name })
      .then((movie) =>
        movie
          ? res.json(movie.Director)
          : res.status(404).send("Director not found")
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

// 6. Allow users to update their user info
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
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
  }
);

// 7. Allow users to add a movie to their list of favorites
app.post(
  "/users/:username/movies/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $push: { FavoriteMovies: req.params.movieId } },
      { new: true }
    )
      .then((updatedUser) => res.json(updatedUser))
      .catch((err) => res.status(500).send("Error: " + err));
  }
);

// 8. Allow users to remove a movie from their list of favorites
app.delete(
  "/users/:username/movies/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $pull: { FavoriteMovies: req.params.movieId } },
      { new: true }
    )
      .then((updatedUser) => res.json(updatedUser))
      .catch((err) => res.status(500).send("Error: " + err));
  }
);

// 9. Allow existing users to deregister
app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndDelete({ Username: req.params.username })
      .then((user) => {
        if (user) {
          res.status(200).send(`${req.params.username} was deleted.`);
        } else {
          res.status(404).send("User not found");
        }
      })
      .catch((err) => res.status(500).send("Error: " + err));
  }
);

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// const port = process.env.PORT || 8080;
// app.listen(port, "0.0.0.0", () => {
//   console.log("Listening on Port " + port);
// });
