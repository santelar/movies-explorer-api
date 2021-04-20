const { NODE_ENV, JWT_SECRET_KEY } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AuthError = require('../errors/401-authError');
const ValidationError = require('../errors/400-validationError');
const NotFoundError = require('../errors/404-notFoundError');
const ConflictError = require('../errors/409-conflictError');

const createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError('Такой email уже есть в базе');
      }
      bcrypt
        .hash(password, 10)
        .then((hash) => User.create({
          email,
          password: hash,
          name,
        }))
        .catch((err) => {
          if (err.name === 'ValidationError') {
            throw new ValidationError('Переданы некорректные данные');
          }
          return next(err);
        })
        .then(() => {
          res.status(200).send({ message: 'Пользователь успешно зарегистрирован' });
        })
        .catch(next);
    })
    .catch(next);
};

const loginUser = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthError('Требуется авторизация! Введите корректные email и пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new AuthError('Требуется авторизация! Введите корректные email и пароль');
          }
          return user;
        });
    })
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET_KEY : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(next);
};

const getMyProfile = (req, res, next) => {
  User.findById(req.user._id)
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        throw new ValidationError('Некорректный id пользователя');
      }
      return next(err);
    })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.status(200).send({ email: user.email, name: user.name });
    })
    .catch((err) => next(err));
};

const updateProfile = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { email, name },
    { new: true, runValidators: true },
  )
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError('Переданы некорректные данные');
      }
      return next(err);
    })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.status(200).send(user);
    })
    .catch((err) => next(err));
};

module.exports = {
  createUser,
  loginUser,
  getMyProfile,
  updateProfile,
};
