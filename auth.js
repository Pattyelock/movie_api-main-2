const jwt = require('jsonwebtoken');
const passport = require('passport');

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret'; // Use an environment variable

const generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: '7d',
    algorithm: 'HS256',
  });
};

module.exports = (app) => {
  app.post('/login', (req, res) => {
    const { Username, Password } = req.body;
    if (!Username || !Password) {
      return res.status(400).json({ message: 'Username and Password are required' });
    }

    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      req.login(user, { session: false }, (error) => {
        if (error) {
          console.error('Login failed:', error);
          return res.status(500).send('Login failed.');
        }

        const userPayload = { _id: user._id, Username: user.Username };
        const token = generateJWTToken(userPayload);
        return res.json({ user: userPayload, token });
      });
    })(req, res);
  });
};
