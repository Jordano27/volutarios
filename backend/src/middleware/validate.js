import { AppError } from '../utils/AppError.js';

export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema(req[source]);
    if (result.length > 0) {
      return next(new AppError('Dados inválidos.', 422, result));
    }
    return next();
  };
}

export function validateId(req, _res, next) {
  const values = Object.values(req.params);
  const invalid = values.some((value) => !/^\d+$/.test(String(value)) || Number(value) <= 0);
  if (invalid) return next(new AppError('Identificador inválido.', 400));
  return next();
}
