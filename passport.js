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
    async (username, password, callback) => {
      console.log(`${username} ${password}`);
      await Users.findOne({ Username: username })
        .then((user) => {
          if (!user) {
            console.log("Incorrect username");
            return callback(null, false, {
              message: "Incorrect username or password.",
            });
          }
          if (!user.validatePassword(password)) {
            console.log("Incorrect password");
            return callback(null, false, { message: "Incorrect password." });
          }
          console.log("Login successful");
          return callback(null, user);
        })
        .catch((error) => {
          console.log(error);
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
