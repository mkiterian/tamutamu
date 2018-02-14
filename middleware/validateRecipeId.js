const { ObjectID } = require('mongodb');

module.exports.validateRecipeId = (req, res, next) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ message: 'recipe not found' });
  }

  next();
};
