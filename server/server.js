const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
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

// --- UTILS ---
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    }
  });
};

// --- MIDDLEWARE ---
const protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ status: 'error', message: 'You are not logged in! Please log in to get access.' });
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ status: 'error', message: 'The user belonging to this token does no longer exist.' });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Invalid token or session expired' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// --- ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = await User.create({ fullName, email, password, role });
    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// --- Food Listings CRUD Operations ---

// CREATE a new listing (Donors only)
app.post('/api/listings', protect, restrictTo('Donor'), async (req, res) => {
  try {
    const listing = await FoodListing.create({ ...req.body, donor: req.user.id });
    res.status(201).json({ status: 'success', data: { listing } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// READ all listings (Authenticated users)
app.get('/api/listings', protect, async (req, res) => {
  try {
    // If donor, only show their own listings. If NGO/Volunteer, show relevant ones.
    let filter = {};
    if (req.user.role === 'Donor') {
      filter = { donor: req.user.id };
    } else if (req.query.donorId) {
      filter = { donor: req.query.donorId };
    }
    
    const listings = await FoodListing.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: { listings } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// UPDATE a listing
app.put('/api/listings/:id', protect, async (req, res) => {
  try {
    // Basic authorization: Donors can update their own, NGOs can update status, Volunteers can update status/location
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ status: 'error', message: 'Listing not found' });

    // Role-specific update logic
    if (req.user.role === 'Donor' && listing.donor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ status: 'error', message: 'You can only update your own listings' });
    }

    const updatedListing = await FoodListing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({ status: 'success', data: { listing: updatedListing } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// DELETE a listing (Donors only)
app.delete('/api/listings/:id', protect, restrictTo('Donor', 'Admin'), async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ status: 'error', message: 'Listing not found' });

    if (req.user.role !== 'Admin' && listing.donor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ status: 'error', message: 'You can only delete your own listings' });
    }

    await FoodListing.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// --- Notifications CRUD Operations ---

app.get('/api/notifications/:userId', protect, async (req, res) => {
  try {
    if (req.params.userId !== req.user.id.toString()) {
      return res.status(403).json({ status: 'error', message: 'You can only view your own notifications' });
    }
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: { notifications } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/notifications', protect, async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ status: 'success', data: { notification } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

app.delete('/api/notifications/:id', protect, async (req, res) => {
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
