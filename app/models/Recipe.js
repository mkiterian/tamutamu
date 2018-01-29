const mongoose = require('mongoose');
const { Schema } = mongoose;

const recipeSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Recipe name is required'],
    minlength: 2
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'Recipe description is required'],
    minlength: 10
  },
  _user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  imageUrl: String,
  ingredients: {
    type: [String],
    required: [true, 'Recipe must have at least one ingredient']
  },
  directions: {
    type: [String],
    required: [true, 'Recipe must have at least one direction']
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  comments: [{
    body: {
      type: String,
      required: [true, 'Comment body is required'],
    },
    datePosted: Date,
    postedBy: String
  }]
});

module.exports = mongoose.model('Recipe', recipeSchema);