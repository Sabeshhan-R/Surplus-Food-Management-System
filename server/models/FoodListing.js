const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  item: {
    type: String,
    required: [true, 'Please provide the food item name'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide the quantity'],
    min: 1
  },
  type: {
    type: String,
    enum: ['Cooked Meal', 'Groceries', 'Fruits', 'Bakery'],
    required: true
  },
  expiry: {
    type: Date,
    required: [true, 'Please provide an expiry date and time']
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Transit', 'Picked Up', 'Rejected'],
    default: 'Pending'
  },
  volunteer: {
    type: String, // Keeping it simple for now as requested. Ideally, this would be an ObjectId referencing User.
    default: 'Not Assigned'
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const FoodListing = mongoose.model('FoodListing', foodListingSchema);
module.exports = FoodListing;
