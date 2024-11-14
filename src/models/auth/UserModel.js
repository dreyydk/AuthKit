// Import required modules
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define the User schema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name!"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email!"],
      unique: true,
      trim: true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "Please add a valid email!",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password!"],
    },
    photo: {
      type: String,
      default: "https://freesvg.org/img/abstract-user-flat-4.png",
    },
    bio: {
      type: String,
      default: "I am a new user.",
    },
    role: {
      type: String,
      enum: ["user", "admin", "creator"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    minimize: false, // Preserve empty objects
  }
);

// Hash the password before saving the user document
UserSchema.pre("save", async function (next) {
  // Check if the password has been modified
  if (!this.isModified("password")) {
    return next();
  }

  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword; // Store the hashed password

  next(); // Proceed to the next middleware
});

// Create the User model
const User = mongoose.model("User ", UserSchema);

// Export the User model
export default User;
