const express = require('express');
const mongoose = require('mongoose');
const { ObjectID} = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const config = require('./config/config');
const Recipe = require('./app/models/Recipe');
const User = require('./app/models/User');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoURI);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/recipes', (req, res) => {
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
    directions
  });

  newRecipe.save().then(doc => {
    res.status(201).send(doc);
  }).catch(err => {
    res.status(400).send(err);
  });
});

app.get('/recipes', (req, res) => {
  Recipe.find().then(recipes => {
    res.status(200).send({ recipes });
  }).catch(err => {
    res.status(400).send(err);
  });
});

app.get('/recipes/:id', (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ message: 'recipe not found' });
  }

  Recipe.findById(id).then(recipe => {
    if (!recipe) {
      return res.status(404).send({ message: 'recipe not found' });
    }
    res.status(200).send({ recipe });
  }).catch(err => {
    res.status(400).send();
  });
})

const PORT = process.env.PORT || config.PORT;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} ...`);
});

module.exports = app;