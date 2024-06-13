const Book = require("../models/bookModel");

// Handler to create a new book entry in the database
exports.createBook = async (req, res) => {
  // Check if the required fields are present in the request body
  if (!req.body.title || !req.body.author || !req.body.isbn) {
    // Respond with an error if any required field is missing
    return res.status(400).json({
      success: false,
      message: "Title, author and ISBN are required.",
    });
  }
  try {
    // Create a new book instance with the request body
    const book = new Book(req.body);
    // Save the new book to the database
    await book.save();
    // Respond with success message if book is added successfully
    res.json({ success: true, message: "Book has been added successfully!" });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      res.status(409).json({ success: false, message: "Book already exists." });
    } else if (error.message.includes("Database connection error")) {
      // Handle database connection error
      res.status(503).json({
        success: false,
        message: "Service unavailable. Please try again later.",
      });
    } else {
      // Handle other errors
      res.status(400).json({
        success: false,
        message: "An error occurred. Please try again.",
      });
    }
  }
};

// Handler to retrieve all books from the database
exports.getBooks = async (req, res) => {
  try {
    // Fetch all books from the database
    const books = await Book.find();

    // Check if any books were found
    if (books.length === 0) {
      // Respond with an error if no books are found
      return res
        .status(404)
        .json({ success: false, message: "No books found." });
    }

    // Respond with the list of books if found
    res.json({ success: true, data: books });
  } catch (error) {
    // Handle database connection error
    if (error.message.includes("Database connection error")) {
      res.status(503).json({
        success: false,
        message: "Service unavailable. Please try again later.",
      });
    } else {
      // Handle other errors
      res.status(500).json({
        success: false,
        message: "An error occurred. Please try again.",
      });
    }
  }
};

// Handler to retrieve a specific book by its ID
exports.getBookById = async (req, res) => {
  // Extract the book ID from the request parameters
  const { bookId } = req.params;
  // Check if the book ID is provided
  if (!bookId) {
    // Respond with an error if book ID is not provided
    return res.status(400).json({ message: "Book ID must be provided." });
  }
  try {
    // Find the book by its ID in the database
    const book = await Book.findById(bookId);
    // Check if the book was found
    if (!book) {
      // Respond with an error if the book is not found
      return res.status(404).json({ message: "Book not found." });
    }
    // Respond with the book details if found
    res.json(book);
  } catch (error) {
    // Log the error to the console
    console.error(error);
    // Respond with an error message
    res
      .status(500)
      .json({ message: "An error occurred while retrieving the book." });
  }
};
