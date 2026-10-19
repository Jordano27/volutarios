import * as volunteerService from '../services/volunteerService.js';

/**
 * Lista voluntários com os filtros da query string.
 * @param {import('express').Request} req requisição HTTP com filtros em query
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após enviar a lista de voluntários
 */
export async function list(req, res) {
  res.json({ data: await volunteerService.listVolunteers(req.query) });
}

/**
 * Busca um voluntário pelo ID.
 * @param {import('express').Request} req requisição HTTP com o ID em params
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após enviar o voluntário encontrado
 */
export async function getById(req, res) {
  res.json({ data: await volunteerService.getVolunteer(req.params.id) });
}

/**
 * Busca o perfil do voluntário autenticado.
 * @param {import('express').Request} req requisição autenticada do voluntário
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após enviar o perfil
 */
export async function getOwn(req, res) {
  res.json({ data: await volunteerService.getOwnVolunteer(req.user.volunteerId) });
}

/**
 * Cadastra um novo voluntário.
 * @param {import('express').Request} req requisição HTTP com dados do voluntário em body
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após enviar o voluntário criado
 */
export async function create(req, res) {
  res.status(201).json({ data: await volunteerService.createVolunteer(req.body) });
}

/**
 * Atualiza um voluntário existente.
 * @param {import('express').Request} req requisição HTTP com ID em params e campos em body
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após enviar o voluntário atualizado
 */
export async function update(req, res) {
  res.json({ data: await volunteerService.updateVolunteer(req.params.id, req.body) });
}

/**
 * Atualiza o próprio perfil do voluntário autenticado.
 * @param {import('express').Request} req requisição autenticada com os dados do perfil
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após enviar o perfil atualizado
 */
export async function updateOwn(req, res) {
  res.json({ data: await volunteerService.updateOwnVolunteer(req.user.volunteerId, req.body) });
}

/**
 * Exclui um voluntário.
 * @param {import('express').Request} req requisição HTTP com o ID em params
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após concluir a exclusão
 */
export async function remove(req, res) {
  await volunteerService.deleteVolunteer(req.params.id);
  res.status(204).send();
}
