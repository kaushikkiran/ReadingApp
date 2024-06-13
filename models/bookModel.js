const mongoose = require("mongoose");

// Define the schema for the book model
// This schema represents the structure of book documents in the MongoDB database
const bookSchema = new mongoose.Schema(
  {
    isbn: { type: String, required: true, unique: true }, // ISBN of the book, must be unique
    title: { type: String, required: true }, // Title of the book, required field
    author: { type: String, required: true }, // Author of the book, required field
    genre: String, // Genre of the book, optional field
    pages: Number, // Number of pages in the book, optional field
    description: String, // Description or summary of the book, optional field
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt timestamps
);

const Books = mongoose.model("books", bookSchema);

module.exports = Books;
