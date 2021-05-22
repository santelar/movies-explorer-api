const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { default: validator } = require('validator');
const AuthError = require('../errors/401-authError');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return validator.isEmail(v);
      },
    },
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
    minlength: 2,
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Новый пользователь',
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new AuthError('Некорректный email или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new AuthError('Некорректный email или пароль'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
