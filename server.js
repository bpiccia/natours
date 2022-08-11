const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({
  path: './config.env',
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.info('db connection successful');
  });

const port = 3000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

//Globally catches any unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(err.name, err.message);
  console.info('Unhandled Rejection, shutting down');
  server.close(() => {
    process.exit(1);
  });
});

//Globally catches and uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(err.name, err.message);
  console.info('UncaughtException, shutting down');
  server.close(() => {
    process.exit(1);
  });
});
