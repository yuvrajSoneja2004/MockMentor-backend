const mongoose = require("mongoose");
const dotEnv = require("dotenv").config();

const connectDB = async () => {
  // Conntect to DB
  try {
    await mongoose.connect(
      `mongodb+srv://yuvrajdev20004:${process.env.MONGO_PASSWORD}@cluster0.7odxccd.mongodb.net/?retryWrites=true&w=majority`,
      {}
    );
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
