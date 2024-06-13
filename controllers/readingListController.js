const ReadingList = require("../models/readingListModel");
//const bookModel = require("../models/bookModel");
const mongoose = require("mongoose");

// Controller action to create a new reading list
exports.createReadingList = async (req, res) => {
  try {
    const { userId, books } = req.body;

    // Input validation
    if (!userId || !books || !Array.isArray(books) || !books.length) {
      return res.status(400).json({
        message:
          "Invalid userId or books. Please provide a valid userId and an list of books.",
      });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format." });
    }

    // Sanitize inputs (Assuming you have a sanitize function or middleware in place)

    // Check for existing reading list for the user
    const existingList = await ReadingList.findOne({ userId });

    // Assuming `books` is an array of new books to be added, each book having a `bookId`
    if (!existingList) {
      // Create a new ReadingList document
      const newList = new ReadingList({
        userId: userId, // Set the userId for the new reading list
        books: books, // Set the initial array of books for the new reading list
      });
      console.log(newList);
      // Save the new reading list to the database
      try {
        const savedList = await newList.save();
        return res
          .status(201)
          .json({ message: "Reading list created successfully", savedList });
      } catch (error) {
        console.error("Error saving the new reading list:", error);
        return res
          .status(500)
          .json({ message: "Failed to create reading list" });
      }
    } else {
      //Extract bookId from both arrays
      const existingBookIds = existingList.books.map((book) =>
        book.bookId.toString()
      );
      const newBookIds = books.map((book) => book.bookId.toString());

      //Check for existing bookId in the new books array
      for (const id of newBookIds) {
        if (existingBookIds.includes(id)) {
          return res
            .status(400)
            .send({ message: "Book already in user's reading list" });
        }
      }
      //Merge and filter for unique bookId
      const uniqueBookIds = [...new Set([...existingBookIds, ...newBookIds])];

      //Rebuild the books array with unique objects
      const updatedBooks = uniqueBookIds.map((id) => {
        // Find the book in the new books array first
        const newBook = books.find((book) => book.bookId.toString() === id);
        // If found, return it, otherwise find it in the existing books
        return (
          newBook ||
          existingList.books.find((book) => book.bookId.toString() === id)
        );
      });

      //Update existingList.books
      existingList.books = updatedBooks;

      //Save the updated list
      await existingList.save();
      return res.status(200).json({ message: "Save successful", existingList });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to create or update the reading list." });
  }
};

// Controller action to get a reading list by user ID
exports.getReadingListById = async (req, res) => {
  try {
    //Extract userId from request
    const { userId } = req.body; // Assuming userId is sent as a URL parameter

    //Query the database for the reading list document using userId
    const readingList = await ReadingList.findOne({ userId });

    //Return the document in the response
    if (readingList) {
      res.status(200).json(readingList);
    } else {
      res
        .status(404)
        .send({ message: "Reading list not found for the given user." });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "An error occurred while fetching the reading list." });
  }
};

// Controller action to update a reading list
exports.updateReadingList = async (req, res) => {
  try {
    const { userId, bookId, status, duration } = req.body;

    //Validate for missing parameters
    if (!userId || !bookId || !status || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    } else if (
      status !== "Read" &&
      status !== "In Progress" &&
      status !== "Unread"
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }
    // Convert userId and bookId from the request to MongoDB ObjectId
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const bookIdObj = new mongoose.Types.ObjectId(bookId);

    // Find the user's reading list document
    const readingList = await ReadingList.findOne({ userId: userIdObj });
    if (!readingList) {
      return res.status(404).json({ message: "Reading list not found" });
    }

    // Locate the book in the reading list
    const bookIndex = readingList.books.findIndex(
      (book) => book.bookId.toString() === bookIdObj.toString()
    );

    if (bookIndex === -1) {
      return res
        .status(404)
        .json({ message: "Book not found in reading list" });
    }

    // Update the book's status and duration using MongoDB $set operator
    const updatePath = `books.${bookIndex}.status`;
    await ReadingList.updateOne(
      { _id: readingList._id, "books.bookId": bookIdObj },
      { $set: { [updatePath]: status, "books.$.duration": duration } }
    );

    res.json({ message: "Reading list updated successfully" });
  } catch (error) {
    console.error("Error updating reading list:", error);
    res.status(500).json({ message: "Error updating reading list" });
  }
};

// Controller action to delete a reading list
exports.deleteReadingList = async (req, res) => {
  try {
    const { userId } = req.body; // Assuming userId is passed as a URL parameter

    const deletedReadingList = await ReadingList.findOneAndDelete({ userId });

    if (!deletedReadingList) {
      return res
        .status(404)
        .json({ message: "Reading list not found for the given user." });
    }

    res.status(200).json({ message: "Reading list successfully deleted." });
  } catch (error) {
    console.error("Error deleting reading list:", error);
    res.status(500).json({ message: "Failed to delete reading list." });
  }
};

exports.deleteBookFromReadingList = async (req, res) => {
  try {
    const { userId, bookId } = req.body; // Extract userId and bookId from URL parameters
    console.log(userId, bookId);
    if (!userId || !bookId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Find the reading list by userId and remove the bookStatus entry with the matching bookId
    const updatedReadingList = await ReadingList.findOneAndUpdate(
      { userId },
      { $pull: { books: { bookId: new mongoose.Types.ObjectId(bookId) } } } // Convert string to ObjectId and match against bookId in the books array
      //{ new: true } // Option to return the document after update
    );

    if (!updatedReadingList) {
      // If no document is found, respond with a 404 error
      return res.status(404).json({ error: "Reading list not found" });
    }

    // Check if the book was successfully removed by looking for its absence
    const bookStillExists = updatedReadingList.books.some(
      (book) => book.bookId.toString() === bookId
    );
    console.log(bookStillExists);
    if (!bookStillExists) {
      // If the book was not removed, it might not have been in the list to begin with
      return res
        .status(404)
        .json({ error: "Book not found in the reading list" });
    }

    // If the book was removed successfully, send a success response
    res.json({ message: "Book deleted from reading list successfully" });
  } catch (error) {
    console.log(error);
    // Handle any errors that occur during the process
    res.status(500).json({ error: "Internal server error" });
  }
};
