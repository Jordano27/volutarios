import { login as loginService } from '../services/authService.js';

/**
 * Processa o login e retorna o token JWT.
 * @param {import('express').Request} req requisição com email e password
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após enviar a sessão autenticada
 */
export async function login(req, res) {
  const result = await loginService(req.body.email, req.body.password);
  res.json(result);
}
