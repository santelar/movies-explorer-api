const { NODE_ENV, JWT_SECRET_KEY } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ValidationError = require('../errors/400-validationError');
const NotFoundError = require('../errors/404-notFoundError');
const ConflictError = require('../errors/409-conflictError');

const createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  if (!email || !password) {
    next(new ValidationError('Не переданы данные (email, пароль или имя)'));
  }
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then(() => {
      res.status(200).send({ message: 'Пользователь успешно зарегистрирован' });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Такой email ранее уже зарегистрирован'));
      }
      next(err);
    });
};

const loginUser = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new ValidationError('Пароль и email обязательны!'));
  }
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET_KEY : 'dev-secret',
        { expiresIn: '7d' },
      );
      return res.status(200).send({ token });
    })
    .catch((err) => {
      next(err);
    });
};

const getMyProfile = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
      }
      res.status(200).send(user);
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
    .then((user) => {
      if (!user) {
        next(new ValidationError('Переданы некорректные данные'));
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
