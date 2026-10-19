export function notFound(req, _res, next) {
  const error = new Error(`Rota não encontrada: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Erro interno do servidor.';
  let details = error.details;

  if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Já existe um registro com um dos valores informados.';
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 422;
    message = 'O registro relacionado não existe.';
  }

  if (statusCode >= 500) {
    console.error(error);
    message = 'Erro interno do servidor.';
    details = undefined;
  }

  res.status(statusCode).json({
    error: message,
    ...(details ? { details } : {}),
  });
}
