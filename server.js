const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./config/db.js");
const routes = require("./routes/router.js");

app.use(express.json());
app.use(cors());
// Connect to MongoDB
connectDB();

// Use routes
app.use("/", routes);

const PORT = process.env.SERVER_PORT || 3000;

// Running the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
