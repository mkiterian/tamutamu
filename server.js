const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const _ = require('lodash');
const mongoose = require('mongoose');

const { validateRecipeId } = require('./middleware/validateRecipeId');
const authenticate = require('./middleware/authenticate');
const config = require('./config/config');
const Recipe = require('./app/models/Recipe');
const User = require('./app/models/User');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoURI);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/users/signup', (req, res) => {
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
});

app.post('/users/login', (req, res) => {
  const { email, password } = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(email, password).then(user => {
    user.generateAuthToken().then(token => {
      res.header('x-auth', token).status(200).send({ user });
    });

  }).catch(err => {
    res.status(401).send({ error: 'Wrong username or password' });
  });
});

app.delete('/users/logout', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch(err => {
    res.status(400).send();
  });
});

app.post('/recipes', authenticate, (req, res) => {
  const {
    name,
    description,
    imageUrl,
    ingredients,
    directions } = req.body;

  const newRecipe = Recipe({
    name,
    description,
    imageUrl,
    ingredients,
    directions,
    _createdBy: req.user._id
  });

  newRecipe.save().then(recipe => {
    res.status(201).send({ recipe });
  }).catch(err => {
    res.status(400).send(err);
  });
});

app.get('/recipes', authenticate, (req, res) => {
  Recipe.find({ _createdBy: req.user._id }).then(recipes => {
    res.status(200).send({ recipes });
  }).catch(err => {
    res.status(400).send(err);
  });
});

app.get('/recipes/:id', authenticate, validateRecipeId, (req, res) => {
  const { id } = req.params;

  Recipe.findOne(
    {
      _id: id,
      _createdBy: req.user._id
    }).then(recipe => {
      if (!recipe) {
        return res.status(404).send({ message: 'recipe not found' });
      }

      res.status(200).send({ recipe });
    }).catch(err => {
      res.status(400).send();
    });
});

app.patch('/recipes/:id', authenticate, validateRecipeId, (req, res) => {
  const { id } = req.params;
  const body = _.pick(req.body, [
    'name', 'description', 'imageUrl', 'ingredients', 'directions'
  ]);

  Recipe.findOneAndUpdate({
    _id: id,
    _createdBy: req.user._id
  }, { $set: body }, { new: true })
    .then(recipe => {
      if (!recipe) {
        return res.status(404).send({ message: 'recipe not found' });
      }

      res.status(200).send({ recipe });
    })
    .catch(err => {
      res.status(400).send({});
    });
});

app.delete('/recipes/:id', authenticate, validateRecipeId, (req, res) => {
  const { id } = req.params;

  Recipe.findOneAndRemove({
    _id: id,
    _createdBy: req.user._id
  }).then(recipe => {
    if (!recipe) {
      return res.status(404).send({ message: 'recipe not found' });
    }

    res.status(200).send({ recipe });
  }).catch(err => {
    res.status(400).send();
  });
});

const PORT = process.env.PORT || config.PORT;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} ...`);
});

module.exports = app;