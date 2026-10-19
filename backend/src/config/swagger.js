export const openapiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Voluntariado IFRS API',
    version: '1.0.0',
    description: 'API REST para gerenciamento de eventos sociais e voluntários.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Ambiente local' }],
  tags: [
    { name: 'Autenticação', description: 'Login e emissão de JWT' },
    { name: 'Dashboard', description: 'Indicadores protegidos' },
    { name: 'Eventos', description: 'CRUD e inscrições em eventos' },
    { name: 'Voluntários', description: 'CRUD de voluntários' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Event: {
        type: 'object',
        required: ['title', 'description', 'event_date', 'location', 'max_volunteers'],
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Campanha de doação de sangue' },
          description: { type: 'string', example: 'Ação em parceria com o hemocentro.' },
          event_date: { type: 'string', format: 'date', example: '2026-11-14' },
          location: { type: 'string', example: 'Campus IFRS - Bloco A' },
          max_volunteers: { type: 'integer', minimum: 1, example: 40 },
          status: { type: 'string', enum: ['active', 'finished', 'cancelled'] },
          volunteer_count: { type: 'integer', example: 2 },
          is_registered: { type: 'boolean', example: false },
        },
      },
      Volunteer: {
        type: 'object',
        required: ['name', 'email', 'phone'],
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Ana Souza' },
          email: { type: 'string', format: 'email', example: 'ana@example.com' },
          phone: { type: 'string', example: '(51) 99999-1111' },
          status: { type: 'string', enum: ['active', 'inactive'] },
        },
      },
      VolunteerCreate: {
        type: 'object',
        required: ['name', 'email', 'phone', 'password'],
        properties: {
          name: { type: 'string', example: 'Ana Souza' },
          email: { type: 'string', format: 'email', example: 'ana@example.com' },
          phone: { type: 'string', example: '(51) 99999-1111' },
          password: { type: 'string', minLength: 6, format: 'password', writeOnly: true, example: '123456' },
          status: { type: 'string', enum: ['active', 'inactive'] },
        },
      },
      Registration: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Ana Souza' },
          email: { type: 'string', format: 'email', example: 'ana@example.com' },
          phone: { type: 'string', example: '(51) 99999-1111' },
          status: { type: 'string', enum: ['active', 'inactive'] },
          registered_at: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: { error: { type: 'string' }, details: { type: 'array' } },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autentica um usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@ifrs.edu.br' },
                  password: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'JWT emitido' },
          401: {
            description: 'Credenciais inválidas',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Retorna indicadores do sistema',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Resumo do dashboard' }, 401: { description: 'Não autenticado' } },
      },
    },
    '/events': {
      get: {
        tags: ['Eventos'],
        summary: 'Lista eventos',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['active', 'finished', 'cancelled'] },
          },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          200: { description: 'Eventos encontrados' },
          401: { description: 'Não autenticado' },
        },
      },
      post: {
        tags: ['Eventos'],
        summary: 'Cadastra evento (admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Event' } } },
        },
        responses: {
          201: { description: 'Evento criado' },
          401: { description: 'Não autenticado' },
          403: { description: 'Apenas administradores' },
          422: { description: 'Dados inválidos' },
        },
      },
    },
    '/events/{id}': {
      get: {
        tags: ['Eventos'],
        summary: 'Busca evento',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Evento encontrado' },
          401: { description: 'Não autenticado' },
          404: { description: 'Não encontrado' },
        },
      },
      put: {
        tags: ['Eventos'],
        summary: 'Atualiza evento (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', minLength: 3 },
                  description: { type: 'string', minLength: 5 },
                  event_date: { type: 'string', format: 'date' },
                  location: { type: 'string', minLength: 3 },
                  max_volunteers: { type: 'integer', minimum: 1 },
                  status: { type: 'string', enum: ['active', 'finished', 'cancelled'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Evento atualizado' },
          401: { description: 'Não autenticado' },
          403: { description: 'Apenas administradores' },
          404: { description: 'Não encontrado' },
          422: { description: 'Dados inválidos' },
        },
      },
      delete: {
        tags: ['Eventos'],
        summary: 'Exclui evento (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          204: { description: 'Evento removido' },
          401: { description: 'Não autenticado' },
          403: { description: 'Apenas administradores' },
          404: { description: 'Não encontrado' },
        },
      },
    },
    '/events/{id}/volunteers': {
      get: {
        tags: ['Eventos'],
        summary: 'Lista voluntários inscritos no evento',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Voluntários inscritos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Registration' } },
                  },
                },
              },
            },
          },
          401: { description: 'Não autenticado' },
          403: { description: 'Voluntários não podem consultar a lista de inscritos' },
          404: { description: 'Evento não encontrado' },
        },
      },
    },
    '/events/{id}/register': {
      post: {
        tags: ['Eventos'],
        summary: 'Inscreve o voluntário autenticado no evento',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          201: { description: 'Inscrição realizada' },
          401: { description: 'Não autenticado' },
          403: { description: 'Apenas voluntários podem usar esta operação' },
          404: { description: 'Evento não encontrado' },
          422: { description: 'Evento finalizado, cancelado, sem vagas ou voluntário inválido' },
        },
      },
      delete: {
        tags: ['Eventos'],
        summary: 'Cancela a inscrição do voluntário autenticado',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          204: { description: 'Inscrição cancelada' },
          401: { description: 'Não autenticado' },
          403: { description: 'Apenas voluntários podem usar esta operação' },
          404: { description: 'Evento ou inscrição não encontrada' },
        },
      },
    },
    '/events/{id}/volunteers/{volunteerId}': {
      post: {
        tags: ['Eventos'],
        summary: 'Inscreve voluntário no evento (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'volunteerId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          201: { description: 'Voluntário inscrito' },
          401: { description: 'Não autenticado' },
          403: { description: 'Apenas administradores' },
          404: { description: 'Evento ou voluntário não encontrado' },
          409: { description: 'Voluntário já inscrito' },
          422: { description: 'Evento finalizado, cancelado ou sem vagas disponíveis' },
        },
      },
      delete: {
        tags: ['Eventos'],
        summary: 'Remove voluntário do evento (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'volunteerId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          204: { description: 'Inscrição removida' },
          401: { description: 'Não autenticado' },
          403: { description: 'Apenas administradores' },
          404: { description: 'Evento ou inscrição não encontrada' },
        },
      },
    },
    '/volunteers': {
      get: {
        tags: ['Voluntários'],
        summary: 'Lista voluntários',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive'] } },
        ],
        responses: {
          200: { description: 'Voluntários encontrados' },
          401: { description: 'Não autenticado' },
        },
      },
      post: {
        tags: ['Voluntários'],
        summary: 'Cadastra voluntário (admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/VolunteerCreate' } } },
        },
        responses: {
          201: { description: 'Voluntário criado' },
          401: { description: 'Não autenticado' },
          403: { description: 'Apenas administradores' },
          409: { description: 'E-mail já cadastrado' },
          422: { description: 'Dados inválidos' },
        },
      },
    },
    '/volunteers/me': {
      get: {
        tags: ['Voluntários'],
        summary: 'Busca o próprio perfil do voluntário',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Perfil encontrado' },
          401: { description: 'Não autenticado' },
          403: { description: 'Apenas voluntários' },
        },
      },
      put: {
        tags: ['Voluntários'],
        summary: 'Atualiza o próprio perfil do voluntário',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 3 },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string', minLength: 8 },
                  password: { type: 'string', minLength: 6, format: 'password', writeOnly: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Perfil atualizado' },
          401: { description: 'Não autenticado' },
          403: { description: 'Apenas voluntários' },
          409: { description: 'E-mail já cadastrado' },
          422: { description: 'Dados inválidos' },
        },
      },
    },
    '/volunteers/{id}': {
      get: {
        tags: ['Voluntários'],
        summary: 'Busca voluntário',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Voluntário encontrado' },
          401: { description: 'Não autenticado' },
          404: { description: 'Não encontrado' },
        },
      },
      put: {
        tags: ['Voluntários'],
        summary: 'Atualiza voluntário (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 3 },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string', minLength: 8 },
                  status: { type: 'string', enum: ['active', 'inactive'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Voluntário atualizado' },
          401: { description: 'Não autenticado' },
          403: { description: 'Apenas administradores' },
          404: { description: 'Não encontrado' },
          409: { description: 'E-mail já cadastrado' },
          422: { description: 'Dados inválidos' },
        },
      },
      delete: {
        tags: ['Voluntários'],
        summary: 'Exclui voluntário (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          204: { description: 'Voluntário removido' },
          401: { description: 'Não autenticado' },
          403: { description: 'Apenas administradores' },
          404: { description: 'Não encontrado' },
        },
      },
    },
  },
};
