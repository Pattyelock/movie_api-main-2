const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const { Movie, User } = require("./models");
const cors = require("cors");
const auth = require("./auth");
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the movie API!");
});

// Passport config
require("./passport"); // Assuming passport config is in a separate file

// Import routes for authentication
auth(app);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("MongoDB connection error:", error));

// Routes

// User Registration (POST /users)
app.post("/users", async (req, res) => {
  const { Username, Password, Email, Birthday } = req.body;

  if (!Username || !Password || !Email) {
    return res
      .status(400)
      .json({ message: "Required fields: Username, Password, Email" });
  }

  try {
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

// User Login (POST /login)
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
      const token = jwt.sign(userPayload, "your_jwt_secret", {
        expiresIn: "7d",
        algorithm: "HS256",
      });

      return res.json({ user: userPayload, token });
    });
  })(req, res);
});

// Get All Movies (GET /movies)
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    return res.json(movies);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching movies", error });
  }
});

// Get Movie by Title (GET /movies/:title)
app.get("/movies/:title", async (req, res) => {
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

// Get Movie by Genre (GET /movies/genre/:genre)
app.get("/movies/genre/:genre", async (req, res) => {
  const { genre } = req.params;
  try {
    const movies = await Movie.find({ "Genre.Name": genre });
    if (movies.length === 0) {
      return res
        .status(404)
        .json({ message: "No movies found for this genre" });
    }
    return res.json(movies);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching movies by genre", error });
  }
});

// Get Movie by Director (GET /movies/director/:director)
app.get("/movies/director/:director", async (req, res) => {
  const { director } = req.params;
  try {
    const movies = await Movie.find({ "Director.Name": director });
    if (movies.length === 0) {
      return res
        .status(404)
        .json({ message: "No movies found by this director" });
    }
    return res.json(movies);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching movies by director", error });
  }
});

// Add Favorite Movie (POST /users/:username/favorites/:movieId)
app.post(
  "/users/:username/favorites/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { username, movieId } = req.params;
    try {
      const user = await User.findOne({ Username: username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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

// Remove Favorite Movie (DELETE /users/:username/favorites/:movieId)
app.delete(
  "/users/:username/favorites/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { username, movieId } = req.params;
    try {
      const user = await User.findOne({ Username: username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.FavoriteMovies.pull(movieId);
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

// Update User Info (PUT /users/:username)
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { username } = req.params;
    const { Email, Birthday } = req.body;
    try {
      const user = await User.findOne({ Username: username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (Email) user.Email = Email;
      if (Birthday) user.Birthday = Birthday;

      await user.save();
      return res
        .status(200)
        .json({ message: "User information updated", user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error updating user info", error });
    }
  }
);

// Delete User (DELETE /users/:username)
app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { username } = req.params;
    try {
      const user = await User.findOneAndDelete({ Username: username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ message: "User deleted", user });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting user", error });
    }
  }
);

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
