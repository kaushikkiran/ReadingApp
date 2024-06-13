const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController"); // Controller with book-related actions
const authenticateToken = require("../config/validateToken");

// Define route for saving books
// POST /saveBooks - Saves a new book with details provided in the request body. Requires token validation.
router.post(
  "/saveBooks",
  authenticateToken.validateToken,
  bookController.createBook
);

// Define route for fetching all books
// GET /getAllBooks - Retrieves all books from the database. Requires token validation.
router.get(
  "/getAllBooks",
  authenticateToken.validateToken,
  bookController.getBooks
);

// Define route for fetching a single book by its ID
// GET /getBookById/:id - Retrieves a specific book by its ID from the database. Requires token validation and user validation.
router.get(
  "/getBookById/:id",
  authenticateToken.validateTokenWithUserValidation,
  bookController.getBookById
);

module.exports = router;
