const { ObjectID } = require('mongodb');

module.exports.validateObjectId = (id, res) => {
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ message: 'recipe not found' });
  }
};