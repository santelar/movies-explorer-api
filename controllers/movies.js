const Movie = require('../models/movie');
const ForbiddenError = require('../errors/403-forbiddenError');
const NotFoundError = require('../errors/404-notFoundError');
const ValidationError = require('../errors/400-validationError');
const ConflictError = require('../errors/409-conflictError');

const getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.status(200).send(movies))
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
  Movie
    .findById(req.params.movieId)
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        throw new ValidationError('Невалидный id фильма');
      }
      return next(err);
    })
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильм не найден');
      }
      if (movie.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Нет прав на удаление этого фильма');
      }
      return Movie.findByIdAndRemove(req.params.movieId)
        .then((m) => {
          res.send({ message: `${'Фильм'} '${m.nameRU}' ${'удален'}` });
        });
    })
    .catch(next);
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
