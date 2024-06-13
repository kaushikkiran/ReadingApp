const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const bcrypt = require("bcrypt");
const Users = require("../models/userModel");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

// Configure options for JWT authentication strategy
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

// Configure Passport to use JWT authentication strategy
passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      // Find the user by ID extracted from the JWT payload
      const user = await Users.findById(jwt_payload.id);
      if (user) {
        // If user is found, return the user object
        console.log(user);
        return done(null, user);
      }
      // If user is not found, return false
      return done(null, false);
    } catch (err) {
      // Handle any errors that occur during the authentication process
      done(err, false);
    }
  })
);

// Configure Passport to use LocalStrategy for authentication
passport.use(
  new LocalStrategy(
    { usernameField: "username" }, // Specify that the username field is called 'username'
    async (username, password, done) => {
      try {
        // Find the user with the provided username
        const user = await Users.findOne({ username });
        // If user is not found, return error
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        // Compare the provided password with the hashed password stored in the database
        const isMatch = await bcrypt.compare(password, user.password);

        // If passwords don't match, return error
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        // Return the user object
        return done(null, user);
      } catch (error) {
        // Handle any errors that occur during the authentication process
        return done(error);
      }
    }
  )
);

// Serialize user object to store in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user object from session
passport.deserializeUser(async (id, done) => {
  try {
    // Find the user by ID
    const user = await Users.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
