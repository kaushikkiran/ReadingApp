// Import necessary modules
const express = require("express"); // Express framework for routing
const router = express.Router(); // Router instance to define routes
//const validateToken = require("../config/validateToken"); // Middleware to validate JWT tokens
const userController = require("../controllers/userController"); // Controller with user-related actions

// Define route for user registration
// POST /register - Registers a new user with the provided details in the request body
router.post("/register", userController.registerUser);

// Define route for user login
// POST /login - Authenticates a user and returns a token if successful
router.post("/login", userController.loginUser);

module.exports = router;
