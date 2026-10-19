USE voluntariado_ifrs;

INSERT INTO users (name, email, role, password_hash)
VALUES
  ('Administrador IFRS', 'admin@ifrs.edu.br', 'admin', 'scrypt$dac-demo-salt-2026$d0551ca89593f0b39397c046e4992d333cffacbb3700d6feb20e1c2597e1bb23f96c948d22938e0a21eea18822741b7fea4530fb5fce3f6813aea04a2c5324a8'),
  ('Usuário IFRS', 'usuario@ifrs.edu.br', 'user', 'scrypt$dac-demo-salt-2026$d0551ca89593f0b39397c046e4992d333cffacbb3700d6feb20e1c2597e1bb23f96c948d22938e0a21eea18822741b7fea4530fb5fce3f6813aea04a2c5324a8');

INSERT INTO events (title, description, event_date, location, max_volunteers, status)
VALUES
  ('Campanha de doação de sangue', 'Ação de conscientização e doação em parceria com o hemocentro regional.', '2026-11-14', 'Campus IFRS - Bloco A', 40, 'active'),
  ('Arrecadação de alimentos', 'Coleta de alimentos não perecíveis para instituições da comunidade.', '2026-12-05', 'Campus IFRS - Auditório', 25, 'active');

INSERT INTO volunteers (name, email, phone, password_hash, status)
VALUES
  ('Ana Souza', 'ana.souza@example.com', '(51) 99999-1111', 'scrypt$dac-demo-salt-2026$d0551ca89593f0b39397c046e4992d333cffacbb3700d6feb20e1c2597e1bb23f96c948d22938e0a21eea18822741b7fea4530fb5fce3f6813aea04a2c5324a8', 'active'),
  ('Bruno Lima', 'bruno.lima@example.com', '(51) 99999-2222', 'scrypt$dac-demo-salt-2026$d0551ca89593f0b39397c046e4992d333cffacbb3700d6feb20e1c2597e1bb23f96c948d22938e0a21eea18822741b7fea4530fb5fce3f6813aea04a2c5324a8', 'active'),
  ('Carla Mendes', 'carla.mendes@example.com', '(51) 99999-3333', 'scrypt$dac-demo-salt-2026$d0551ca89593f0b39397c046e4992d333cffacbb3700d6feb20e1c2597e1bb23f96c948d22938e0a21eea18822741b7fea4530fb5fce3f6813aea04a2c5324a8', 'active');

INSERT INTO event_volunteers (event_id, volunteer_id)
VALUES (1, 1), (1, 2), (2, 3);
