// Import necessary modules
const express = require("express"); // Express framework to simplify HTTP server creation
const session = require("express-session"); // Session middleware for Express
const passport = require("./config/passportConfig"); // Passport for authentication
const mongoose = require("mongoose"); // Mongoose for MongoDB interactions
const cors = require("cors"); // CORS middleware to enable Cross-Origin Resource Sharing
const dotenv = require("dotenv"); // Dotenv for loading environment variables from .env file

// Import routes
const userRoutes = require("./routes/userRoutes"); // Routes for user-related operations
const bookRoutes = require("./routes/bookRoutes"); // Routes for book-related operations
const readingListRoutes = require("./routes/readingListRoutes"); // Routes for reading list operations

// Initialize the Express application
const app = express();

// Configure session middleware for persistent sessions
app.use(
  session({
    secret: "ApiKeyHashed", // Secret key for session hashing (should be replaced with a real secret in production)
    resave: false, // Avoids resaving sessions that haven't changed
    saveUninitialized: true, // Saves uninitialized sessions to the store
  })
);

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Load environment variables from the .env file
dotenv.config({ path: "./config.env" });

// Enable CORS for all requests
app.use(cors());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Connect to MongoDB using the connection URI from the environment variables
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB connected")) // Log on successful connection
  .catch((err) => console.error(err)); // Log any connection errors

// Mount the defined routes to specific paths
app.use("/api/users", userRoutes); // User-related routes
app.use("/api/books", bookRoutes); // Book-related routes
app.use("/api/readingList", readingListRoutes); // Reading list routes

// Default route handler for unmatched routes, returns a 404 error
app.get("*", (req, res) => {
  res.status(404).json({
    errorCode: 404,
    success: false,
    message:
      "Oops! We can't seem to find the page or resource you are looking for",
  });
});

// Start the server on the port specified in the environment variables or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export the Express app for use in other modules
module.exports = app;
