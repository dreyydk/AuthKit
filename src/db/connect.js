import mongoose from "mongoose";

const connect = async () => {
  try {
    console.log("Attempting to connect to the database...");
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("Connected to the database.");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

export default connect;
