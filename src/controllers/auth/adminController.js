// Import necessary modules
import asyncHandler from "express-async-handler";
import User from "../../models/auth/UserModel.js";

// Delete a user by ID
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Attempt to find and delete the user by ID
    const user = await User.findByIdAndDelete(id);

    // Check if the user was found and deleted
    if (!user) {
      return res.status(404).json({ message: "User  not found!" });
    }

    // Respond with success message if user was deleted
    res.status(200).json({ message: "User  deleted successfully!" });
  } catch (error) {
    // Handle any errors that occur during deletion
    console.error("Error deleting user: ", error);
    res.status(500).json({ message: "Cannot delete user!" });
  }
});

// Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find({});

    // Check if any users were found
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found!" });
    }

    // Respond with the list of users
    res.status(200).json(users);
  } catch (error) {
    // Handle any errors that occur during fetching
    console.error("Error fetching users: ", error);
    res.status(500).json({ message: "Cannot get users!" });
  }
});
