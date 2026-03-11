const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');
const FoodListing = require('./models/FoodListing');
const Notification = require('./models/Notification');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/surplus_food';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user (password hashing is handled in User model middleware)
    const newUser = await User.create({
      fullName,
      email,
      password,
      role
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role
        }
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during registration',
      error: err.message
    });
  }
});

// Login route (basic placeholder for now)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// --- Food Listings CRUD Operations ---

// CREATE a new listing
app.post('/api/listings', async (req, res) => {
  try {
    const listing = await FoodListing.create(req.body);
    res.status(201).json({ status: 'success', data: { listing } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// READ all listings (optionally filter by donor ID if provided in query)
app.get('/api/listings', async (req, res) => {
  try {
    const filter = req.query.donorId ? { donor: req.query.donorId } : {};
    const listings = await FoodListing.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: { listings } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// UPDATE a listing
app.put('/api/listings/:id', async (req, res) => {
  try {
    const listing = await FoodListing.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Returns the updated document
      runValidators: true // Ensures the update respects the schema validation
    });
    
    if (!listing) return res.status(404).json({ status: 'error', message: 'Listing not found' });
    
    res.status(200).json({ status: 'success', data: { listing } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// DELETE a listing
app.delete('/api/listings/:id', async (req, res) => {
  try {
    const listing = await FoodListing.findByIdAndDelete(req.params.id);
    
    if (!listing) return res.status(404).json({ status: 'error', message: 'Listing not found' });
    
    
    res.status(204).json({ status: 'success', data: null }); // 204 means No Content
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// --- Notifications CRUD Operations ---

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: { notifications } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ status: 'success', data: { notification } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
