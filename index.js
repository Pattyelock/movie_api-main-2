const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const { Movie, User } = require("./models");
const cors = require("cors");
const auth = require("./auth");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config(); // Load environment variables

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());

// Log headers middleware for debugging
app.use((req, res, next) => {
  console.log("Headers:", req.headers);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the movie API!");
});

// Passport config
require("./passport"); // Assuming passport config is in a separate file

// Import routes for authentication
auth(app);

// Connect to MongoDB using environment variable MONGO_URI
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("MongoDB connection error:", error));

// Validation helper
const validateInput = (input) =>
  typeof input === "string" && input.trim().length > 0;

// Routes

// User Registration (POST /users) - Public route, no authentication needed
app.post("/users", async (req, res) => {
  const { Username, Password, Email, Birthday } = req.body;

  if (!validateInput(Username) || !validateInput(Password) || !validateInput(Email)) {
    return res
      .status(400)
      .json({ message: "Username, Password, and Email are required and cannot be empty." });
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
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ message: "Error creating user", error });
  }
});

// User Login (POST /login) - Public route, no authentication needed
app.post("/login", (req, res) => {
  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (error || !user) {
      console.log("Login error or invalid credentials:", error || info);
      return res.status(400).json({ message: "Invalid username or password" });
    }

    req.login(user, { session: false }, (error) => {
      if (error) {
        console.error("Login failed:", error);
        return res.status(500).send("Login failed.");
      }

      const userPayload = { _id: user._id, Username: user.Username };
      const token = jwt.sign(userPayload, process.env.JWT_SECRET, {
        expiresIn: "7d",
        algorithm: "HS256",
      });

      return res.json({ user: userPayload, token });
    });
  })(req, res);
});

// Get All Movies (GET /movies) - Public route, no authentication needed
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    return res.json(movies);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching movies", error });
  }
});

// Add Favorite Movie (POST /users/:username/favorites/:movieId) - Protected route
app.post(
  "/users/:username/favorites/:movieId",
  passport.authenticate("jwt", { session: false }), // Token authentication required
  async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const { username, movieId } = req.params;
    try {
      const user = await User.findOne({ Username: username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const movieExists = await Movie.findById(movieId);
      if (!movieExists) {
        return res.status(404).json({ message: "Movie not found" });
      }

      if (user.FavoriteMovies.includes(movieId)) {
        return res.status(400).json({ message: "Movie already in favorites" });
      }

      user.FavoriteMovies.push(movieId);
      await user.save();
      return res
        .status(200)
        .json({ message: "Movie added to favorites", user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error adding favorite movie", error });
    }
  }
);

// Remove Favorite Movie (DELETE /users/:username/favorites/:movieId) - Protected route
app.delete(
  "/users/:username/favorites/:movieId",
  passport.authenticate("jwt", { session: false }), // Token authentication required
  async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const { username, movieId } = req.params;
    try {
      const user = await User.findOne({ Username: username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const movieIndex = user.FavoriteMovies.indexOf(movieId);
      if (movieIndex === -1) {
        return res.status(404).json({ message: "Movie not in favorites" });
      }

      user.FavoriteMovies.splice(movieIndex, 1);
      await user.save();
      return res
        .status(200)
        .json({ message: "Movie removed from favorites", user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error removing favorite movie", error });
    }
  }
);

// Start the server after MongoDB connection is established
app.listen(8080, () => {
  console.log("Server running on port 8080");
});
