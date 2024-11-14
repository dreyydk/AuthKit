// Import the crypto module for hashing functions
import crypto from "node:crypto";

/**
 * Hashes a given token using the SHA-256 algorithm.
 *
 * @param {string|number} token - The token to be hashed. Can be a string or number.
 * @returns {string} - The resulting hash in hexadecimal format.
 */
const hashToken = (token) => {
  // Convert the token to a string, create a SHA-256 hash, and return it in hexadecimal format
  return crypto
    .createHash("sha256") // Create a SHA-256 hash object
    .update(token.toString()) // Update the hash with the token
    .digest("hex"); // Finalize the hash and return it as a hexadecimal string
};

// Export the hashToken function for use in other modules
export default hashToken;
