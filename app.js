require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const { limiter } = require('./utils/rateLimiter');
const { apiLogger, errLogger } = require('./middlewares/logger');
const routes = require('./routes/index');
const serverError = require('./errors/500-serverError');
const mongoDbLocal = require('./utils/config');

const { PORT = 3001 } = process.env;
const app = express();

const mongoDB = process.env.NODE_ENV === 'production' ? process.env.MONGO_URL : mongoDbLocal;
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  // eslint-disable-next-line no-console
}).then(() => console.log('Congratulations!!!'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiLogger);
app.use(limiter);
app.use(cors());
app.use(helmet());


app.use('/', routes);

app.use(errLogger);
app.use(errors());
app.use(serverError);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Movie-explorer project start on port ${PORT}`);
});
