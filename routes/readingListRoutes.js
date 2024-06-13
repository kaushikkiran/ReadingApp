const express = require("express");
const router = express.Router();
const readingListController = require("../controllers/readingListController"); // Controller with reading list-related actions
const validateToken = require("../config/validateToken");

// Define route for creating a new reading list
// POST /saveReadingList - Creates a new reading list with details provided in the request body. Requires token validation and user validation.
router.post(
  "/saveReadingList",
  validateToken.validateTokenWithUserValidation,
  readingListController.createReadingList
);

// Define route for fetching a reading list by user ID
// GET /getReadingListbyId - Retrieves a reading list based on the user ID from the token. Requires token validation and user validation.
router.get(
  "/getReadingListbyId/",
  validateToken.validateTokenWithUserValidation,
  readingListController.getReadingListById
);

// Define route for updating an existing reading list
// POST /updateReadingList - Updates an existing reading list with new details provided in the request body. Requires token validation and user validation.
router.post(
  "/updateReadingList/",
  validateToken.validateTokenWithUserValidation,
  readingListController.updateReadingList
);

// Define route for deleting an existing reading list
// POST /deleteReadingList - Deletes an existing reading list based on the ID provided in the request body. Requires token validation and user validation.
router.post(
  "/deleteReadingList/",
  validateToken.validateTokenWithUserValidation,
  readingListController.deleteReadingList
);

// Define route for removing a book from an existing reading list
// POST /deleteBookFromReadingList - Removes a specific book from a reading list. Requires token validation and user validation.
router.post(
  "/deleteBookFromReadingList/",
  validateToken.validateTokenWithUserValidation,
  readingListController.deleteBookFromReadingList
);

module.exports = router;
