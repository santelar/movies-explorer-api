const router = require('express').Router();
const users = require('./users');
const movies = require('./movies');
const { loginUser, createUser } = require('../controllers/users');
const auth = require('../middlewares/auth');
const { validateSignup, validateSignin } = require('../middlewares/validate.js');
const NotFoundError = require('../errors/404-notFoundError');

router.post('/signup', validateSignup, createUser);
router.post('/signin', validateSignin, loginUser);

router.use('/users', auth, users);
router.use('/movies', auth, movies);

router.use(() => {
  throw new NotFoundError('Страница не найдена');
});

module.exports = router;
