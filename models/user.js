const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

/**
 * User Schema
 */
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  places: { // TODO: dynamic array of place id's
    type: String,
    required: true,
  },
});

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema);
