const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const { Movie, User } = require("./models");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());

require("dotenv").config(); // Load environment variables from .env file

// Passport config
require("./passport"); // Assuming passport config is in a separate file

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the movie API!");
});

// Connect to MongoDB using environment variable MONGO_URI
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("MongoDB connection error:", error));

// Routes

// User Registration (POST /users)
app.post("/users", async (req, res) => {
  const { Username, Password, Email, Birthday } = req.body;

  // Validate Username and Password
  if (!Username || !Password || !Email) {
    return res
      .status(400)
      .json({ message: "Required fields: Username, Password, Email" });
  }

  // Disallow spaces in the Username and Password
  if (/\s/.test(Username) || /\s/.test(Password)) {
    return res.status(400).json({
      message: "Username and Password cannot contain spaces.",
    });
  }

  try {
    const existingUser = await User.findOne({ Username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = User.hashPassword(Password);
    const newUser = new User({
      Username,
      Password: hashedPassword,
      Email,
      Birthday,
    });

    await newUser.save();
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ message: "Error creating user", error });
  }
});

// User Login (POST /login) with JWT Authentication
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
        expiresIn: "7d", // Token expires in 7 days
        algorithm: "HS256", // HS256 encryption
      });

      return res.json({ user: userPayload, token });
    });
  })(req, res);
});

// Middleware to verify the JWT token
const verifyJWT = (req, res, next) => {
  const token = req.header("Authorization") && req.header("Authorization").split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user information to request object
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

// Add Favorite Movie (POST /users/:username/favorites/:movieId) - Protected with JWT
app.post(
  "/users/:username/favorites/:movieId",
  verifyJWT,
  async (req, res) => {
    const { username, movieId } = req.params;

    // Check if the movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    try {
      const user = await User.findOne({ Username: username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the movie is already in the user's favorites
      if (user.FavoriteMovies.includes(movieId)) {
        return res.status(400).json({ message: "Movie already added to favorites" });
      }

      user.FavoriteMovies.push(movieId);
      await user.save();
      return res.status(200).json({ message: "Movie added to favorites", user });
    } catch (error) {
      return res.status(500).json({ message: "Error adding favorite movie", error });
    }
  }
);

// Remove Favorite Movie (DELETE /users/:username/favorites/:movieId) - Protected with JWT
app.delete(
  "/users/:username/favorites/:movieId",
  verifyJWT,
  async (req, res) => {
    const { username, movieId } = req.params;
    try {
      const user = await User.findOne({ Username: username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.FavoriteMovies.pull(movieId);
      await user.save();
      return res.status(200).json({ message: "Movie removed from favorites", user });
    } catch (error) {
      return res.status(500).json({ message: "Error removing favorite movie", error });
    }
  }
);

// Get All Movies (GET /movies) - Protected with JWT
app.get("/movies", verifyJWT, async (req, res) => {
  try {
    const movies = await Movie.find();
    return res.json(movies);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching movies", error });
  }
});

// Get Movie by Title (GET /movies/:title) - Protected with JWT
app.get("/movies/:title", verifyJWT, async (req, res) => {
  const { title } = req.params;
  try {
    const movie = await Movie.findOne({ Title: title });
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    return res.json(movie);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching movie", error });
  }
});

// Get Movie by Genre (GET /movies/genre/:genre) - Protected with JWT
app.get("/movies/genre/:genre", verifyJWT, async (req, res) => {
  const { genre } = req.params;
  try {
    const movies = await Movie.find({ "Genre.Name": genre });
    if (movies.length === 0) {
      return res.status(404).json({ message: "No movies found for this genre" });
    }
    return res.json(movies);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching movies by genre", error });
  }
});

// Get Movie by Director (GET /movies/director/:director) - Protected with JWT
app.get("/movies/director/:director", verifyJWT, async (req, res) => {
  const { director } = req.params;
  try {
    const movies = await Movie.find({ "Director.Name": director });
    if (movies.length === 0) {
      return res.status(404).json({ message: "No movies found by this director" });
    }
    return res.json(movies);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching movies by director", error });
  }
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});

