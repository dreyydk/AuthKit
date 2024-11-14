// Import required modules
import mongoose from "mongoose";

// Define the Token schema
const TokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User ", // Reference to the User model
    required: true,
  },
  verificationToken: {
    type: String,
    default: "", // Default value for verification token
  },
  passwordResetToken: {
    type: String,
    default: "", // Default value for password reset token
  },
  createdAt: {
    type: Date,
    required: true, // Timestamp when the token was created
    default: Date.now, // Automatically set the current date as the default value
  },
  expiresAt: {
    type: Date,
    required: true, // Timestamp when the token expires
  },
});

// Create the Token model
const Token = mongoose.model("Token", TokenSchema);

// Export the Token model
export default Token;
