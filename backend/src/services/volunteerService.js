import * as volunteerModel from '../models/volunteerModel.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword } from '../utils/password.js';

/**
 * Normaliza os campos textuais de um voluntário antes da persistência.
 * @param {Object} data dados recebidos para o voluntário
 * @returns {Object} dados com textos sem espaços excedentes
 */
function normalizeVolunteer(data, { allowPassword = false } = {}) {
  const normalized = {
    ...data,
    name: data.name?.trim(),
    email: data.email?.toLowerCase().trim(),
    phone: data.phone?.trim(),
  };

  delete normalized.password;
  delete normalized.password_hash;
  if (allowPassword && data.password) normalized.password_hash = hashPassword(data.password);
  return normalized;
}

/**
 * Lista voluntários.
 * @param {Object} [filters={}] filtros de busca e status
 * @returns {Promise<Array<Object>>} voluntários encontrados
 */
export async function listVolunteers(filters) {
  return volunteerModel.findAllVolunteers(filters);
}

/**
 * Busca um voluntário ou retorna 404.
 * @param {number|string} id identificador do voluntário
 * @returns {Promise<Object>} voluntário encontrado
 * @throws {AppError} quando o voluntário não existe
 */
export async function getVolunteer(id) {
  const volunteer = await volunteerModel.findVolunteerById(id);
  if (!volunteer) throw new AppError('Voluntário não encontrado.', 404);
  return volunteer;
}

/**
 * Busca o perfil do voluntário autenticado.
 * @param {number|string} id identificador do voluntário autenticado
 * @returns {Promise<Object>} perfil encontrado
 */
export async function getOwnVolunteer(id) {
  return getVolunteer(id);
}

/**
 * Cria um voluntário.
 * @param {Object} data dados validados do voluntário
 * @returns {Promise<Object>} voluntário criado
 */
export async function createVolunteer(data) {
  return volunteerModel.createVolunteer(normalizeVolunteer(data, { allowPassword: true }));
}

/**
 * Atualiza um voluntário.
 * @param {number|string} id identificador do voluntário
 * @param {Object} data campos validados para atualização
 * @returns {Promise<Object>} voluntário atualizado
 * @throws {AppError} quando o voluntário não existe
 */
export async function updateVolunteer(id, data) {
  await getVolunteer(id);
  return volunteerModel.updateVolunteer(id, normalizeVolunteer(data));
}

/**
 * Atualiza o próprio perfil do voluntário, incluindo a senha opcional.
 * @param {number|string} id identificador do voluntário autenticado
 * @param {Object} data campos do perfil validados
 * @returns {Promise<Object>} perfil atualizado
 */
export async function updateOwnVolunteer(id, data) {
  await getVolunteer(id);
  return volunteerModel.updateVolunteer(id, normalizeVolunteer(data, { allowPassword: true }));
}

/**
 * Exclui um voluntário.
 * @param {number|string} id identificador do voluntário
 * @returns {Promise<void>} resolve após excluir o voluntário
 * @throws {AppError} quando o voluntário não existe
 */
export async function deleteVolunteer(id) {
  await getVolunteer(id);
  await volunteerModel.deleteVolunteer(id);
}
