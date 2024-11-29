const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors"); // Importing CORS package
require("dotenv").config(); // Load environment variables from .env file

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000; // Use the PORT from .env or default to 3000
const DataB = process.env.DATAB; // Get the MongoDB connection string from .env

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

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
  emailOrPhone: { type: String, required: true, unique: true }, // Email or Phone number
  password: { type: String, required: true }, // Password
  createdAt: { type: Date, default: Date.now },
});

// Define model
const User = mongoose.model("User", userSchema);

// Signup Endpoint (Store email or phone number and password)
app.post("/signup", async (req, res) => {
  console.log("Signup request received:", req.body);
  const { emailOrPhone, password } = req.body;

  // Check if both fields are provided
  if (!emailOrPhone || !password) {
    return res
      .status(400)
      .json({ message: "Email/Phone and password are required." });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ emailOrPhone });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    // Create and save the new user (without hashing the password for now)
    const newUser = new User({ emailOrPhone, password });
    await newUser.save();

    return res.status(201).json({ message: "User registered successfully." });
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

// Catch-all route for undefined endpoints (this will help return a proper 404)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
