const mongoose = require('mongoose');

const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]+\.[a-zA-Z0-9()]+([-a-zA-Z0-9()@:%_\\+.~#?&/=#]*)/;

const movieSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return regex.test(v);
      },
      message: 'Некорректный адрес',
    },
  },
  trailer: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return regex.test(v);
      },
      message: 'Некорректный адрес',
    },
  },
  thumbnail: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return regex.test(v);
      },
      message: 'Некорректный адрес',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user',
    select: false,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'movie',
  },
  nameRU: {
    type: String,
    required: true,
  },
  nameEN: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('movie', movieSchema);
