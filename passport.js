const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Models = require("./models.js");
const passportJWT = require("passport-jwt");

let Users = Models.User;
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

// LocalStrategy for username/password
passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },
    (username, password, callback) => {
      Users.findOne({ Username: username })
        .then((user) => {
          if (!user) {
            return callback(null, false, { message: "Incorrect username or password." });
          }
          return callback(null, user);
        })
        .catch((error) => callback(error));
    }
  )
);

// JWTStrategy for token validation
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret",
    },
    (jwtPayload, callback) => {
      return Users.findById(jwtPayload._id)
        .then((user) => callback(null, user))
        .catch((error) => callback(error));
    }
  )
);
