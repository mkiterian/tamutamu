const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const _ = require('lodash');
const mongoose = require('mongoose');

const { validateRecipeId } = require('./middleware/validateRecipeId');
const authenticate = require('./middleware/authenticate');
const recipeControllers = require('./app/controllers/recipeControllers');
const userControllers = require('./app/controllers/userControllers');
const config = require('./config/config');
const Recipe = require('./app/models/Recipe');
const User = require('./app/models/User');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/users/signup', userControllers.signupUser);

app.post('/users/login', userControllers.loginUser);

app.delete('/users/logout', authenticate, userControllers.logoutUser);

app.post('/recipes', authenticate, recipeControllers.postRecipe);

app.get('/recipes', authenticate, recipeControllers.getRecipes);

app.get('/recipes/:id', authenticate, validateRecipeId, recipeControllers.getRecipe);

app.patch('/recipes/:id', authenticate, validateRecipeId, recipeControllers.updateRecipe);

app.delete('/recipes/:id', authenticate, validateRecipeId, recipeControllers.deleteRecipe);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} ...`);
});

module.exports = app;