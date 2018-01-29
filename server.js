const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const config = require('./config/config');
require('./app/models/Recipe');
require('./app/models/User');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoURI);

const Recipe = mongoose.model('Recipe');
const User = mongoose.model('User');

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

const PORT = process.env.PORT || config.PORT;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} ...`);
});

module.exports.app = app;