const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables

const { Movie, User } = require("./models");
const auth = require("./auth");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());

// Debugging middleware
app.use((req, res, next) => {
  console.log("Incoming Request:", {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
  });
  next();
});

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the movie API!");
});

// Passport configuration
require("./passport");
auth(app);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Helper function
const validateInput = (input) =>
  typeof input === "string" && input.trim().length > 0;

// Routes

// User Registration
app.post("/users", async (req, res) => {
  const { Username, Password, Email, Birthday } = req.body;

  if (
    !validateInput(Username) ||
    !validateInput(Password) ||
    !validateInput(Email)
  ) {
    return res
      .status(400)
      .json({ message: "All fields are required and cannot be empty." });
  }

  try {
    const hashedPassword = User.hashPassword(Password);
    const newUser = new User({
      Username: Username.trim(),
      Password: hashedPassword,
      Email: Email.trim(),
      Birthday,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error });
  }
});

// User Login
app.post("/login", (req, res) => {
  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (error || !user) {
      console.error("Login error:", error || info);
      return res.status(400).json({ message: "Invalid username or password" });
    }

    req.login(user, { session: false }, (loginError) => {
      if (loginError) {
        console.error("Login failed:", loginError);
        return res.status(500).send("Login failed.");
      }

      const userPayload = { _id: user._id, Username: user.Username };
      const token = jwt.sign(userPayload, process.env.JWT_SECRET, {
        expiresIn: "7d",
        algorithm: "HS256",
      });

      res.json({ user: userPayload, token });
    });
  })(req, res);
});

// Get All Movies
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ message: "Error fetching movies", error });
  }
});

// Add Favorite Movie
app.post(
  "/users/:username/favorites/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { username, movieId } = req.params;

    try {
      const user = await User.findOne({ Username: username });
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.FavoriteMovies.includes(movieId)) {
        return res.status(400).json({ message: "Movie already in favorites" });
      }

      user.FavoriteMovies.push(movieId);
      await user.save();
      res.status(200).json({ message: "Movie added to favorites", user });
    } catch (error) {
      console.error("Error adding favorite movie:", error);
      res.status(500).json({ message: "Error adding favorite movie", error });
    }
  }
);

// Remove Favorite Movie
app.delete(
  "/users/:username/favorites/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { username, movieId } = req.params;

    try {
      const user = await User.findOne({ Username: username });
      if (!user) return res.status(404).json({ message: "User not found" });

      const movieIndex = user.FavoriteMovies.indexOf(movieId);
      if (movieIndex === -1)
        return res.status(404).json({ message: "Movie not in favorites" });

      user.FavoriteMovies.splice(movieIndex, 1);
      await user.save();
      res.status(200).json({ message: "Movie removed from favorites", user });
    } catch (error) {
      console.error("Error removing favorite movie:", error);
      res.status(500).json({ message: "Error removing favorite movie", error });
    }
  }
);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
