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
    maxlength: 13
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
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