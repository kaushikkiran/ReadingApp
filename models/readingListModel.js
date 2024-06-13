const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the bookStatusSchema
// This schema represents the status of each book in a user's reading list
const bookStatusSchema = new Schema(
  {
    bookId: {
      type: Schema.Types.ObjectId, // References a book document's ObjectId
      ref: "books", // Establishes a reference to the 'books' collection
      required: true,
    },
    status: {
      type: String,
      enum: ["Unread", "In Progress", "Finished"], // Enumerated values for status
      default: "Unread",
    },
    duration: {
      type: Number, // Represents the total reading time in minutes
      default: 0, // Default duration is 0
    },
    _id: false, // Prevents Mongoose from creating an _id for this subdocument
  },
  { timestamps: true }
);

// Define the readingListSchema
// This schema represents a user's reading list
const readingListSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId, // References a user document's ObjectId
      ref: "users", // Establishes a reference to the 'users' collection
      required: true,
    },
    books: [bookStatusSchema], // Array of book statuses, using the bookStatusSchema
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt timestamps for the reading list
);

const ReadingList = mongoose.model("reading_list", readingListSchema);

module.exports = ReadingList;
