const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getMyProfile,
  updateProfile,
} = require('../controllers/users.js');

router.get('/me', getMyProfile);
router.patch('/me',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      name: Joi.string().required().min(2).max(30),
    }),
  }),
  updateProfile);

module.exports = router;
