const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.DATABASE_URL; // Replace with your MongoDB URI
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Contact = mongoose.model("Contact", contactSchema);

// Signup Route
app.post("/signup", async (req, res) => {
  const { name, mobile, email, password } = req.body;

  try {
    // Check if email or mobile already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email or Mobile already exists" });
    }

    // Create new user
    const newUser = new User({ name, mobile, email, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, mobile, password } = req.body;

  try {
    // Find user by email or mobile
    const user = await User.findOne({
      $or: [{ email }, { mobile }],
      password, // Match password directly since no encryption is needed
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Contact Us Route
app.post("/contactus", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Create a new contact entry
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    res.status(201).json({ message: "Your message has been received. Thank you!" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});


// Server Start
const PORT = 8344;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
