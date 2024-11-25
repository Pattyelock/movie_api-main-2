const jwt = require("jsonwebtoken");
const passport = require("passport");

const jwtSecret = "your_jwt_secret"; // Keep this secure!

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // Encodes the username
    expiresIn: "7d", // Token validity
    algorithm: "HS256", // Signing algorithm
  });
};

module.exports = (app) => {
  app.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: "Invalid username or password",
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
