const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Models = require("./models.js");
const passportJWT = require("passport-jwt");

let Users = Models.User; // User model
let JWTStrategy = passportJWT.Strategy; // JWT strategy
let ExtractJWT = passportJWT.ExtractJwt; // Extractor for JWT tokens

// LocalStrategy: Used for login with username and password
passport.use(
  new LocalStrategy(
    {
      usernameField: "Username", // Field for username
      passwordField: "Password", // Field for password
    },
    (username, password, callback) => {
      console.log(`Attempting login for user: ${username}`);
      Users.findOne({ Username: username })
        .then((user) => {
          if (!user) {
            console.log("Login failed: Incorrect username");
            return callback(null, false, { message: "Incorrect username or password." });
          }
          // Successful authentication
          console.log("Login successful");
          return callback(null, user);
        })
        .catch((error) => {
          console.error("Error during login:", error);
          return callback(error);
        });
    }
  )
);

// JWTStrategy: Used to authenticate endpoints using JWT tokens
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), // Token extracted from Authorization header
      secretOrKey: "your_jwt_secret", // Secret key for verifying the token
    },
    (jwtPayload, callback) => {
      console.log("JWT payload received:", jwtPayload);
      Users.findById(jwtPayload._id)
        .then((user) => {
          if (user) {
            console.log("JWT authentication successful");
            return callback(null, user);
          } else {
            console.log("JWT authentication failed: User not found");
            return callback(null, false);
          }
        })
        .catch((error) => {
          console.error("Error during JWT authentication:", error);
          return callback(error, false);
        });
    }
  )
);

