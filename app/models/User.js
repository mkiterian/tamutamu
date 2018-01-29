const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    required: [true, 'Must provide an email address'],
    minlength: 5
  }
});

module.exports = mongoose.model('User', userSchema);
