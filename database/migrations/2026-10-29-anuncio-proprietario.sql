-- ============================================================
-- Anúncio avulso para proprietários: plano com pagamento único
-- e prazo (dias), e público do plano (profissional ou proprietário).
-- Rode depois de 2026-10-28-marketplace.sql. Pode ser executado mais de uma vez.
-- Rode com: mysql --default-character-set=utf8mb4 -u USUARIO -p < este-arquivo.sql
-- ============================================================

USE `fgr_imoveis`;

ALTER TABLE `plans`
  MODIFY `billing_interval` ENUM('month','year','once') NOT NULL DEFAULT 'month';

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'plans' AND COLUMN_NAME = 'audience');
SET @sql := IF(@c = 0,
  'ALTER TABLE `plans`
     ADD COLUMN `audience` ENUM(''profissional'',''proprietario'') NOT NULL DEFAULT ''profissional'' AFTER `slug`,
     ADD COLUMN `duration_days` SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT ''Prazo do pagamento único (billing_interval = once)'' AFTER `billing_interval`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Evita aplicar o mesmo pagamento único duas vezes (retorno do Checkout + webhook)
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'advertisers' AND COLUMN_NAME = 'last_checkout_session');
SET @sql := IF(@c = 0,
  'ALTER TABLE `advertisers` ADD COLUMN `last_checkout_session` VARCHAR(100) NULL AFTER `cancel_at_period_end`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Anúncios avulsos iniciais (o Admin pode editar preço, prazo e benefícios)
INSERT IGNORE INTO `plans` (`name`,`slug`,`audience`,`description`,`price`,`billing_interval`,`duration_days`,`max_listings`,`max_featured`,`features`,`highlighted`,`display_order`) VALUES
('Anúncio simples','anuncio-simples','proprietario','Um imóvel no portal por 60 dias, sem mensalidade.',49.00,'once',60,1,0,'Até 30 fotos\nContatos direto no seu WhatsApp e no painel\nEdite o anúncio quando quiser',0,1),
('Anúncio destaque','anuncio-destaque','proprietario','Um imóvel em destaque na página inicial por 60 dias.',89.00,'once',60,1,1,'Aparece em destaque na página inicial\nAté 30 fotos\nContatos direto no seu WhatsApp e no painel',1,2);
