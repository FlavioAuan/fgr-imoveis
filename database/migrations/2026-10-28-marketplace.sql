-- ============================================================
-- Marketplace: planos, anunciantes (imobiliárias, corretores e
-- proprietários), pagamentos via Stripe e anúncios por anunciante.
-- Para bancos já instalados. Pode ser executado mais de uma vez.
-- Rode com: mysql --default-character-set=utf8mb4 -u USUARIO -p < este-arquivo.sql
-- ============================================================

USE `fgr_imoveis`;

CREATE TABLE IF NOT EXISTS `plans` (
  `id`                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`              VARCHAR(100) NOT NULL,
  `slug`              VARCHAR(120) NOT NULL,
  `description`       VARCHAR(500) NULL,
  `price`             DECIMAL(10,2) NOT NULL DEFAULT 0,
  `billing_interval`  ENUM('month','year') NOT NULL DEFAULT 'month',
  `trial_days`        SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `max_listings`      INT UNSIGNED NULL COMMENT 'NULL = ilimitado',
  `max_featured`      INT UNSIGNED NOT NULL DEFAULT 0,
  `features`          TEXT NULL COMMENT 'Um benefício por linha',
  `highlighted`       TINYINT(1) NOT NULL DEFAULT 0,
  `active`            TINYINT(1) NOT NULL DEFAULT 1,
  `display_order`     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `stripe_product_id` VARCHAR(100) NULL,
  `stripe_price_id`   VARCHAR(100) NULL,
  `created_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_plans_slug` (`slug`),
  KEY `idx_plans_active` (`active`,`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `advertisers` (
  `id`                     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`                   VARCHAR(100) NOT NULL,
  `company_name`           VARCHAR(150) NULL,
  `kind`                   ENUM('imobiliaria','corretor','proprietario') NOT NULL DEFAULT 'imobiliaria',
  `document`               VARCHAR(20) NULL COMMENT 'CNPJ ou CPF',
  `creci`                  VARCHAR(50) NULL,
  `phone`                  VARCHAR(30) NULL,
  `email`                  VARCHAR(150) NOT NULL,
  `password`               VARCHAR(255) NOT NULL,
  `active`                 TINYINT(1) NOT NULL DEFAULT 1,
  `plan_id`                INT UNSIGNED NULL,
  `stripe_customer_id`     VARCHAR(100) NULL,
  `stripe_subscription_id` VARCHAR(100) NULL,
  `subscription_status`    VARCHAR(30) NULL COMMENT 'Status do Stripe: active, trialing, past_due, canceled...',
  `current_period_end`     DATETIME NULL,
  `cancel_at_period_end`   TINYINT(1) NOT NULL DEFAULT 0,
  `last_login`             DATETIME NULL,
  `created_at`             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_advertisers_email` (`email`),
  KEY `idx_advertisers_customer` (`stripe_customer_id`),
  KEY `idx_advertisers_subscription` (`stripe_subscription_id`),
  CONSTRAINT `fk_advertisers_plan` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payments` (
  `id`                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `advertiser_id`      INT UNSIGNED NOT NULL,
  `plan_id`            INT UNSIGNED NULL,
  `stripe_invoice_id`  VARCHAR(100) NOT NULL,
  `amount`             DECIMAL(10,2) NOT NULL DEFAULT 0,
  `currency`           VARCHAR(3) NOT NULL DEFAULT 'brl',
  `status`             VARCHAR(30) NOT NULL,
  `invoice_url`        VARCHAR(500) NULL,
  `paid_at`            DATETIME NULL,
  `created_at`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payments_invoice` (`stripe_invoice_id`),
  KEY `idx_payments_advertiser` (`advertiser_id`),
  CONSTRAINT `fk_payments_advertiser` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_plan` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- properties.advertiser_id (funciona em MySQL 8 e MariaDB, sem ADD COLUMN IF NOT EXISTS)
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'properties' AND COLUMN_NAME = 'advertiser_id'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `properties`
     ADD COLUMN `advertiser_id` INT UNSIGNED NULL AFTER `agent_id`,
     ADD KEY `idx_properties_advertiser` (`advertiser_id`),
     ADD CONSTRAINT `fk_properties_advertiser` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers` (`id`)',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Planos iniciais (o Admin pode editar; preços sobem para o Stripe no primeiro salvamento ou na primeira assinatura)
INSERT IGNORE INTO `plans` (`name`,`slug`,`description`,`price`,`billing_interval`,`trial_days`,`max_listings`,`max_featured`,`features`,`highlighted`,`display_order`) VALUES
('Corretor','corretor','Para corretores autônomos que querem aparecer no portal.',79.00,'month',0,15,1,'Até 15 anúncios ativos\n1 anúncio em destaque\nLeads direto no seu painel\nContato por WhatsApp e formulário',0,1),
('Imobiliária','imobiliaria','Para imobiliárias que querem todo o estoque no portal.',199.00,'month',0,80,5,'Até 80 anúncios ativos\n5 anúncios em destaque\nLeads direto no seu painel\nRelatório mensal de visitas e contatos',1,2),
('Imobiliária Plus','imobiliaria-plus','Estoque ilimitado e mais destaque na busca.',399.00,'month',0,NULL,15,'Anúncios ilimitados\n15 anúncios em destaque\nLeads direto no seu painel\nRelatório mensal de visitas e contatos\nAtendimento prioritário',0,3);
