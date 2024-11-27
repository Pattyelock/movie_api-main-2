const jwt = require("jsonwebtoken");
const passport = require("passport");

const jwtSecret = "your_jwt_secret"; // Make sure this matches the secret in passport.js

/**
 * Function to generate a JWT token for authenticated users.
 * @param {Object} user - The user object to encode in the JWT.
 * @returns {string} - The signed JWT token.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // Username encoded in the token
    expiresIn: "7d", // Token expires in 7 days
    algorithm: "HS256", // HS256 signing algorithm
  });
};

/**
 * Defines the `/login` route for user authentication.
 * @param {Object} app - The Express app instance.
 */
module.exports = (app) => {
  app.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error || !user) {
        console.log("Login error or invalid credentials:", error || info);
        return res.status(400).json({
          message: "Invalid username or password",
          user: user,
        });
      }

      req.login(user, { session: false }, (error) => {
        if (error) {
          console.error("Login failed:", error);
          return res.status(500).send("Login failed.");
        }

        // Prepare user payload and generate JWT
        const userPayload = {
          _id: user._id,
          Username: user.Username,
        };
        let token = generateJWTToken(userPayload);

        // Return the user object and JWT
        console.log("Login successful:", user.Username);
        return res.json({ user: userPayload, token });
      });
    })(req, res);
  });
};
