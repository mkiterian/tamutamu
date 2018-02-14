const _ = require('lodash');
const User = require('../models/User');

exports.signupUser = (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (confirmPassword !== password) {
    return res.status(400).send({ error: 'passwords do not match' });
  }
  const user = User({
    email,
    password
  });

  user.save().then(() => {
    return user.generateAuthToken();
  }).then(token => {
    res.header('x-auth', token).status(201).send({ user });
  }).catch(err => {
    res.status(400).send(err);
  });
}

exports.loginUser = (req, res) => {
  const { email, password } = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(email, password).then(user => {
    user.generateAuthToken().then(token => {
      res.header('x-auth', token).status(200).send({ user });
    });

  }).catch(err => {
    res.status(401).send({ error: 'Wrong username or password' });
  });
}

exports.logoutUser = (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch(err => {
    res.status(400).send();
  });
}