const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const config = require('./config/config');
require('./app/models/Recipe');
require('./app/models/User');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoURI);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || config.PORT;

app.listen(PORT, ()=>{
  console.log(`Listening on port ${PORT} ...`);
});

module.exports.app = app;