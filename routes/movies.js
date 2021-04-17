const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies.js');

router.get('/', getMovies);
router.post('/',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required().min(2),
      image: Joi.string().required().pattern(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]+\.[a-zA-Z0-9()]+([-a-zA-Z0-9()@:%_\\+.~#?&/=#]*)/,
      ),
      trailer: Joi.string().required().pattern(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]+\.[a-zA-Z0-9()]+([-a-zA-Z0-9()@:%_\\+.~#?&/=#]*)/,
      ),
      thumbnail: Joi.string().required().pattern(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]+\.[a-zA-Z0-9()]+([-a-zA-Z0-9()@:%_\\+.~#?&/=#]*)/,
      ),
      owner: Joi.string().required().length(24).hex(),
      movieId: Joi.string().required().length(24).hex(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  createMovie);
router.delete('/:movieId',
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().required().length(24).hex(),
    }),
  }),
  deleteMovie);

module.exports = router;
