const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the user schema with various fields
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true, // Username is a required field
      unique: true, // Ensures usernames are unique across the collection
      trim: true,
    },
    email: {
      type: String,
      required: true, // Email is a required field
      unique: true, // Ensures emails are unique across the collection
      trim: true, // Trims whitespace from the email
    },
    active: {
      type: Boolean,
      required: true, // Active status is a required field
      default: true, // Default value for active status is true
    },
    password: {
      type: String,
      required: true, // Password is a required field
      minlength: 8, // Sets a minimum length for the password
    },
    role: {
      type: String,
      enum: ["Admin", "RegisteredUser"], // Enumerates possible values for role
      default: "RegisteredUser", // Default value for role is "RegisteredUser"
    },
  },
  { timestamps: true }
);

const Users = mongoose.model("user", userSchema);
module.exports = Users;
