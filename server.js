// Import necessary modules
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import connect from "./src/db/connect.js";

// Load environment variables from .env file
dotenv.config();

// Define the port for the server to listen on
const port = process.env.PORT || 8000;

// Initialize the Express application
const app = express();

// Middleware configuration
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true })); // Enable CORS with specified origin
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cookieParser()); // Parse cookies from request headers

// Dynamically load and register route files
const registerRoutes = () => {
  const routeFiles = fs.readdirSync("./src/routes"); // Read all route files from the specified directory

  routeFiles.forEach((file) => {
    import(`./src/routes/${file}`)
      .then((route) => {
        app.use("/api/v1", route.default); // Register the route with a base path
      })
      .catch((error) => {
        console.error(`Failed to load route file: ${file}`, error); // Log error with specific file name
      });
  });
};

// Start the server and connect to the database
const startServer = async () => {
  try {
    await connect(); // Connect to the database
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`); // Log successful server start
    });
  } catch (error) {
    console.error("Error starting the server:", error.message); // Log error message if connection fails
    process.exit(1); // Exit the process with failure
  }
};

// Execute route registration and server start
registerRoutes();
startServer();
