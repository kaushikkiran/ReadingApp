const Users = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const passport = require("../config/passportConfig");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const expiresIn = 7 * 24 * 60 * 60; // 1 week in seconds

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });
};

// Register a new user
exports.registerUser = async (req, res) => {
  const { username, password, email, role } = req.body;

  // Check if all required fields are provided
  if (!username || !email || !password) {
    res.status(400).json({
      success: false,
      message: "Please add all fields (Username, email, password) & try again.",
    });
  }

  // Check if user already exists
  const userExists = await Users.findOne({ username });
  if (userExists) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }

  //Hash the password before saving it to the database
  bcrypt.genSalt(10, (err, salt) => {
    let genericError =
      "We encountered an issue while securing your information. Please retry.";
    if (err) {
      return res.status(500).json({
        success: false,
        message: genericError, //Error generating salt
      });
    }
    bcrypt.hash(req.body.password, salt, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ success: false, message: genericError }); //Error hashing password
      }
      const password = hashedPassword;
      const username = req.body.username;
      const role = req.body.role;
      const email = req.body.email;
      const newUser = new Users({
        username,
        password,
        role,
        email,
      });
      const token = generateToken(newUser);
      newUser
        .save()
        .then(() =>
          res.json({
            success: true,
            message: "User has been registered successfully!",
            token,
          })
        )
        .catch((error) =>
          res.status(500).json({
            success: false,
            message: "Error saving user",
            error: error.message,
          })
        );
    });
  });
};

// Check user credentials and generate a token
exports.loginUser = (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    async (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (!user) {
        return res.status(400).json({ message: info.message });
      }
      const token = generateToken(user);

      // Save the updated user object
      try {
        await user.save();
      } catch (err) {
        return res.status(500).json({
          success: false,
          message:
            "There was an issue saving your information. Please try again later.",
        });
      }

      // Send the token in the response
      res.status(200).json({ token: token, message: "success" });
    }
  )(req, res, next);
};
