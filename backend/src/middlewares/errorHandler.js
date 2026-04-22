const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Lỗi server',
    code: err.code || 'SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  const err = new Error(`Không tìm thấy route: ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

module.exports = { errorHandler, notFound };
