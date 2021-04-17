require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const { limiter } = require('./utils/rateLimiter');
const { apiLogger, errLogger } = require('./middlewares/logger');
const routes = require('./routes/index');
const NotFoundError = require('./errors/404-notFoundError');
const serverError = require('./errors/500-serverError');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/bestfilmsdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
})
  .then(() => console.log('Congratulations!!!'));

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);
app.use(() => {
  throw new NotFoundError('Страница не найдена');
});

app.use(apiLogger);
app.use(errLogger);
app.use(errors());
app.use(serverError);
app.use(limiter);

app.listen(PORT, () => {
  console.log(`Mesto-project start on port ${PORT}`);
});
