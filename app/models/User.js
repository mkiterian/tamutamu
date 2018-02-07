const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const { Schema } = mongoose;
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const jwtSecret = process.env.JWT_SECRET;

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

userSchema.methods.toJSON = function () {
  const user = this;
  const userRep = user.toObject();

  return _.pick(userRep, ['_id', 'email']);
}

userSchema.methods.generateAuthToken = function () {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({ _id: user._id.toHexString(), access }, jwtSecret).toString();

  user.tokens.push({ access, token });
  return user.save().then(() => {
    return token;
  });
}

userSchema.methods.removeToken = function (token) {
  const user = this;
  return user.update({
    $pull: {
      tokens: { token }
    }
  });
};

userSchema.statics.findByToken = function (token) {
  const User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch (err) {
    return Promise.reject();
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
}

userSchema.statics.findByCredentials = function (email, password) {
  const User = this;

  return User.findOne({ email }).then(user => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, match) => {
        if (match) {
          resolve(user);
        } else {
          reject();
        }
      });
    });


  })
}

userSchema.pre('save', function (next) {
  const user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      })
    })
  } else {
    next();
  }
});

module.exports = mongoose.model('User', userSchema);
