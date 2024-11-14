// Import the jsonwebtoken library for creating and verifying JSON Web Tokens
import jwt from "jsonwebtoken";

/**
 * Generates a JSON Web Token (JWT) for a given user ID.
 *
 * @param {string} id - The ID of the user for whom the token is generated.
 * @returns {string} - The generated JWT.
 */
const generateToken = (id) => {
  // Create and return a signed JWT with the user ID and expiration time
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token will expire in 30 days
  });
};

// Export the generateToken function for use in other modules
export default generateToken;
