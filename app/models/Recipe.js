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
  _createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  imageUrl: String,
  tags: {
    type: [String]
  },
  ingredients: {
    type: [String],
    required: [true, 'Recipe must have at least one ingredient'],
    default: undefined
  },
  directions: {
    type: [String],
    required: [true, 'Recipe must have at least one direction'],
    default: undefined
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
    datePosted: {
      type: Date,
      default: Date.now
    },
    postedBy: String
  }]
});

module.exports = mongoose.model('Recipe', recipeSchema);