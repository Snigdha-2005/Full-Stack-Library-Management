const mongoose = require("mongoose");


const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^(978|979)[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid ISBN!`
    }
  },
  genres: [{
    type: String
  }],

  publication_year: {
    type: Number,
    min: 1400,
    max: new Date().getFullYear()
  },
  publisher: String,
  cover_url: String,
  pages: {
    type: Number,
    min: 1
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
});




module.exports = mongoose.model('Book', bookSchema);
