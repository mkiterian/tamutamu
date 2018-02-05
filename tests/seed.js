const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');
const Recipe = require('../app/models/Recipe');
const User = require('../app/models/User');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const seedUsers = [
  {
    _id: userOneId,
    email: 'user1@example.com',
    password: 'simplepassword1',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: userOneId.toHexString(), access: 'auth' }, 'asdfmovie').toString()
    }]
  },
  {
    _id: userTwoId,
    email: 'user2@example.com',
    password: 'simplepassword2'
  }
]

const testRecipe = {
  _id: new ObjectID(),
  name: 'Soul Food',
  description: 'I\'ve got soul but I\'m not a soldier',
  imageUrl: 'http://wherepicsare.com',
  tags: ['Mama\'s', 'Dinner', 'Carnivore'],
  ingredients: ['ingredient 1', 'ingredient 2', 'ingredient 3'],
  directions: ['eat', 'pray', 'love']
}

const seedRecipes = [
  {
    _id: new ObjectID(),
    name: 'KDF',
    description: 'If you need a description you do not deserve it',
    imageUrl: 'http://wherepicsare.com',
    tags: ['Breakfast', 'Snack', 'Donut'],
    ingredients: ['wheat flour', 'water', 'no baking soda'],
    directions: ['eat', 'pray', 'love']
  },
  {
    _id: new ObjectID(),
    name: 'Githeri',
    description: 'For that good *ss sleep',
    imageUrl: 'http://wherepicsare.com',
    tags: ['Mama\'s', 'Dinner', 'Vegeterian'],
    ingredients: ['maize', 'beans', 'water'],
    directions: ['eat', 'pray', 'love']
  }
];

const populateRecipes = (done) => {
  Recipe.remove({})
    .then(() => {
      return Recipe.insertMany(seedRecipes);
    })
    .then(() => {
      done();
    });
}

const populateUsers = (done) => {
  User.remove({}).then(() => {
    const user1 = new User(seedUsers[0]).save();
    const user2 = new User(seedUsers[1]).save();

    return Promise.all([user1, user2]);
  }).then(() => done());
}

module.exports = { testRecipe, seedRecipes, seedUsers, populateUsers, populateRecipes };