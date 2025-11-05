const mongoose = require('mongoose');

const otpphoneSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (v) => /^(\+\d{1,3}[- ]?)?\d{10}$/.test(v), // Basic phone number validation
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const OTPphone = mongoose.model('OTPphone', otpphoneSchema);

module.exports = OTPphone;
