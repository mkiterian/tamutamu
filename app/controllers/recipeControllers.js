const _ = require('lodash');
const Recipe = require('../models/Recipe');

exports.postRecipe = (req, res) => {
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
}

exports.getRecipes = (req, res) => {
  Recipe.find({ _createdBy: req.user._id }).then(recipes => {
    res.status(200).send({ recipes });
  }).catch(err => {
    res.status(400).send(err);
  });
}

exports.getRecipe = (req, res) => {
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
}

exports.updateRecipe = (req, res) => {
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
}

exports.deleteRecipe = (req, res) => {
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
}