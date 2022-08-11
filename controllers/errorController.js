const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  //Programming or other unknown error: dont leak error details
  else {
    //Log the error
    console.error('Error!', err);

    //Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const duplicateArray = Object.entries(err.keyValue)[0];
  const field = duplicateArray[0];
  const value = duplicateArray[1];
  const message = `Duplicate field value: ${value} for ${field}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  return new AppError('Invalid token. Please login again', 401);
};

const handleJWTExpired = (err) => {
  return new AppError('Token Expired. Please login again', 401);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; //internal server error
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    //Mongoose erro de cast
    if (error.name == 'CastError') {
      error = handleCastErrorDB(error);
    }
    //Mongoose erro de duplicado
    else if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    //Mongoose validation error
    else if (error._message.includes('validation failed')) {
      error = handleValidationErrorDB(error);
    }
    //Token JWT inválido
    else if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }
    //Token JWT expirado
    else if (error.name === 'TokenExpiredError') {
      error = handleJWTExpired(error);
    }

    sendErrorProd(error, res);
  }
};
