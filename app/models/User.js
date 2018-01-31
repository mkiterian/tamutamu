const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const { Schema } = mongoose;
const _ = require('lodash');

const userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, 'Must provide an email address'],
    minlength: 5,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 8,

  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

userSchema.methods.toJSON = function(){
  const user = this;
  const userRep = user.toObject();

  return _.pick(userRep, ['_id', 'email']);
}

userSchema.methods.generateAuthToken = function () {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({ _id: user._id.toHexString(), access }, 'asdfmovie').toString();

  user.tokens.push({ access, token });
  return user.save().then(() => {
    return token;
  });
}

module.exports = mongoose.model('User', userSchema);
