# Voluntariado IFRS

Sistema monolítico para gerenciamento de ações de voluntariado, desenvolvido conforme a especificação da prova P1 de Desenvolvimento de Aplicações Corporativas.

## Stack

- API: Node.js, Express e MySQL.
- Front-end: React + Vite.
- Segurança: JWT, rotas protegidas e autorização por papel.
- Documentação: Swagger/OpenAPI e JSDoc.

## Funcionalidades

- Login com usuário.
- Login de voluntário.
- Dashboard protegido.
- CRUD de eventos.
- CRUD de voluntários.
- Inscrição e remoção de voluntários em eventos.
- Inscrição própria de voluntários autenticados.
- Regra de limite máximo de voluntários por evento.
- Interface React com telas de login, dashboard, eventos e voluntários.

## Usuário de demonstração

```text
E-mail: admin@ifrs.edu.br
Senha: 123456
Perfil: admin
```

Um voluntário de demonstração também pode acessar o sistema:

```text
E-mail: ana.souza@example.com
Senha: 123456
Perfil: volunteer
```

Voluntários visualizam somente os eventos e podem se inscrever após confirmar a ação no modal. O cadastro da conta e a definição da senha são feitos por um administrador na tela de voluntários.

## Pré-requisitos

- Node.js 20 ou superior.
- MySQL 8 ou superior.

## Instalação

1. Crie o banco e as tabelas:

   ```bash
   mysql -u root -p < backend/database/schema.sql
   mysql -u root -p voluntariado_ifrs < backend/database/seed.sql
   ```

2. Configure o back-end:

   ```bash
   cd backend
   copy .env.example .env
   npm install
   npm run dev
   ```

3. Em outro terminal, configure e execute o front-end:

   ```bash
   cd frontend
   copy .env.example .env
   npm install
   npm run dev
   ```

4. Acesse `http://localhost:5173`.

## Documentação da API

Com o back-end em execução, acesse:

- Swagger UI: `http://localhost:3000/docs`
- Health check: `http://localhost:3000/health`

Exemplos de chamadas estão em [`tests.rest`](tests.rest).

## Verificações de qualidade

```bash
cd backend
npm run lint
npm run format:check

cd ../frontend
npm run lint
npm run format:check
npm run build
```

## Organização do projeto

```text
backend/
  src/
    config/        configurações de ambiente, banco e Swagger
    controllers/   adaptação HTTP para os serviços
    middleware/    autenticação, autorização, validação e erros
    models/        operações de persistência
    routes/        definição das rotas REST
    services/      regras de negócio
    validators/    validação das entradas
frontend/
  src/
    api/            cliente HTTP
    components/     componentes reutilizáveis
    context/        sessão do usuário
    pages/          telas da aplicação
backend/database/  scripts SQL de schema e dados fictícios
```

