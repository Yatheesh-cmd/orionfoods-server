const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);
    console.log(
      "Mongo host:",
      process.env.MONGO_URI?.split("@")[1]?.split("/")[0]
    );

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:");
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;