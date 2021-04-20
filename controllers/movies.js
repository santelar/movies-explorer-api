const Movie = require('../models/movie');
const ForbiddenError = require('../errors/403-forbiddenError');
const NotFoundError = require('../errors/404-notFoundError');
const ValidationError = require('../errors/400-validationError');
const ConflictError = require('../errors/409-conflictError');

const getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.send(movies))
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
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  Movie.findOne({ movieId })
    .then((m) => {
      if (m) {
        throw new ConflictError('Данный id уже занят');
      }
      Movie.create({
        country,
        director,
        duration,
        year,
        description,
        image,
        trailer,
        thumbnail,
        owner: req.user._id,
        movieId,
        nameRU,
        nameEN,
      })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            throw new ValidationError('Некорректные данные');
          }
          return next(err);
        })
        .then((movie) => res.status(200).send(movie))
        .catch(next);
    })
    .catch(next);
};

const deleteMovie = (req, res, next) => {
  const owner = req.user._id;
  Movie
    .findById({ _id: req.params.movieId }).select('+owner')
    .orFail(() => new NotFoundError('Данный фильм не найден'))
    .then((movie) => {
      if (!movie.owner.equals(owner)) {
        next(new ForbiddenError('У вас нет прав на удаление этого фильма'));
      } else {
        Movie.deleteOne(movie)
          .then(() => res.send({ message: `Фильм удален - ${movie.nameRU}, ${movie.year}` }));
      }
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        next(new ValidationError('Некорректный id фильма'));
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
