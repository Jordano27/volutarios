import { getDashboardSummary } from '../services/dashboardService.js';

/**
 * Retorna indicadores do sistema para o usuário autenticado.
 * @param {import('express').Request} req requisição com o usuário preenchido pelo middleware JWT
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após enviar os indicadores
 */
export async function getDashboard(req, res) {
  const summary = await getDashboardSummary();
  res.json({ user: req.user, summary });
}
