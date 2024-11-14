// Import mongoose for database connection
import mongoose from "mongoose";

// Function to connect to the MongoDB database
const connect = async () => {
  try {
    console.log("Attempting to connect to the database...");

    // Connect to the database using the URI from environment variables
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, // Use the new URL parser
      useUnifiedTopology: true, // Use the new Server Discover and Monitoring engine
    });

    console.log("Connected to the database successfully.");
  } catch (error) {
    // Log the error message and exit the process if the connection fails
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

// Export the connect function for use in other modules
export default connect;
