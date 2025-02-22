const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: [/^(?:\+91\d{10}|\+(?!91)[1-9]\d{7,14})$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
  },
  password: {
    type: String,
  },
  profilePicture: {
    type: String,
    default: '/images/default-avatar.svg'
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  reservations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
}, {
  timestamps: true
});

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);