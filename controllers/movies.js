const Movie = require('../models/movie');
const ForbiddenError = require('../errors/403-forbiddenError');
const NotFoundError = require('../errors/404-notFoundError');
const ValidationError = require('../errors/400-validationError');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.status(200).send({ movies }))
    .catch((err) => next(err));
};

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.status(200).send({ body: movie }))
    .catch((err) => next(err));
};

const deleteMovie = (req, res, next) => {
  const owner = req.user._id;
  Movie
    .findOne({ _id: req.params.movieId })
    .orFail(() => new NotFoundError('Фильм не найден'))
    .then((movie) => {
      if (!movie.owner.equals(owner)) {
        next(new ForbiddenError('Нет прав на удаление этого фильма'));
      } else {
        Movie.deleteOne(movie)
          .then(() => res.status(200).send({ message: 'Фильм удален' }));
      }
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        next(new ValidationError('Невалидный id фильма'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
