const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const validateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer Token

  if (!token) {
    return res.status(401).json({ message: "Access token is missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user details to request
    next(); // Proceed to the next middleware
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token has expired" });
    } else {
      return res.status(403).json({ message: "Token is invalid" });
    }
  }
};
const validateTokenWithUserValidation = async (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1]; // Expected format: "Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access token is missing or invalid." });
  }

  try {
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, () => {
      next();
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token has expired." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Token is invalid." });
    } else {
      // Handle other possible errors
      console.error(error);
      return res
        .status(500)
        .json({ message: "An error occurred while validating the token." });
    }
  }
};
module.exports = { validateToken, validateTokenWithUserValidation };
