-- ============================================================
-- FGR Imóveis — Schema MySQL completo
-- Compatível com PHPMyAdmin
-- ============================================================

CREATE DATABASE IF NOT EXISTS `fgr_imoveis`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `fgr_imoveis`;

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100) NOT NULL,
  `email`       VARCHAR(150) NOT NULL,
  `password`    VARCHAR(255) NOT NULL,
  `role`        ENUM('super_admin','admin','corretor') NOT NULL DEFAULT 'corretor',
  `active`      TINYINT(1) NOT NULL DEFAULT 1,
  `last_login`  DATETIME NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- AGENTS (Corretores)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `agents` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100) NOT NULL,
  `photo`       VARCHAR(500) NULL,
  `phone`       VARCHAR(30) NULL,
  `email`       VARCHAR(150) NULL,
  `creci`       VARCHAR(50) NULL,
  `bio`         TEXT NULL,
  `active`      TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- FEATURES (Características)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `features` (
  `id`    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`  VARCHAR(100) NOT NULL,
  `icon`  VARCHAR(100) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_features_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- PLANS e ADVERTISERS (Marketplace)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- PROPERTIES (Imóveis)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `properties` (
  `id`                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code`              VARCHAR(20) NOT NULL,
  `slug`              VARCHAR(250) NOT NULL,
  `title`             VARCHAR(250) NOT NULL,
  `transaction_type`  ENUM('venda','aluguel') NOT NULL DEFAULT 'venda',
  `property_type`     ENUM('casa','apartamento','cobertura','studio','terreno','comercial','condominio') NOT NULL DEFAULT 'apartamento',
  `status`            ENUM('disponivel','vendido','alugado','reservado','inativo') NOT NULL DEFAULT 'disponivel',
  `featured`          TINYINT(1) NOT NULL DEFAULT 0,
  `price`             DECIMAL(15,2) NOT NULL DEFAULT 0,
  `condominium_fee`   DECIMAL(10,2) NULL,
  `iptu`              DECIMAL(10,2) NULL,
  `area`              DECIMAL(10,2) NULL,
  `built_area`        DECIMAL(10,2) NULL,
  `bedrooms`          TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `suites`            TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `bathrooms`         TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `parking_spaces`    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `description`       TEXT NULL,
  `city`              VARCHAR(100) NOT NULL,
  `state`             VARCHAR(2) NOT NULL DEFAULT 'SP',
  `neighborhood`      VARCHAR(100) NULL,
  `address`           VARCHAR(250) NULL,
  `zipcode`           VARCHAR(10) NULL,
  `latitude`          DECIMAL(10,8) NULL,
  `longitude`         DECIMAL(11,8) NULL,
  `youtube_url`       VARCHAR(500) NULL,
  `virtual_tour_url`  VARCHAR(500) NULL,
  `seo_title`         VARCHAR(160) NULL,
  `seo_description`   VARCHAR(320) NULL,
  `seo_keywords`      VARCHAR(500) NULL,
  `agent_id`          INT UNSIGNED NULL,
  `advertiser_id`     INT UNSIGNED NULL,
  `created_by`        INT UNSIGNED NULL,
  `created_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_properties_code` (`code`),
  UNIQUE KEY `uq_properties_slug` (`slug`),
  KEY `idx_properties_status` (`status`),
  KEY `idx_properties_type` (`transaction_type`,`property_type`),
  KEY `idx_properties_featured` (`featured`),
  KEY `idx_properties_city` (`city`),
  KEY `idx_properties_price` (`price`),
  KEY `idx_properties_advertiser` (`advertiser_id`),
  CONSTRAINT `fk_properties_agent` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_properties_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_properties_advertiser` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- PROPERTY IMAGES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `property_images` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `property_id`   INT UNSIGNED NOT NULL,
  `image_path`    VARCHAR(500) NOT NULL,
  `display_order` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `is_cover`      TINYINT(1) NOT NULL DEFAULT 0,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_images_property` (`property_id`),
  CONSTRAINT `fk_images_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- PROPERTY FEATURES (many-to-many)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `property_features` (
  `property_id` INT UNSIGNED NOT NULL,
  `feature_id`  INT UNSIGNED NOT NULL,
  PRIMARY KEY (`property_id`,`feature_id`),
  CONSTRAINT `fk_pf_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pf_feature` FOREIGN KEY (`feature_id`) REFERENCES `features` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- LEADS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `leads` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100) NOT NULL,
  `email`       VARCHAR(150) NULL,
  `phone`       VARCHAR(30) NULL,
  `message`     TEXT NULL,
  `property_id` INT UNSIGNED NULL,
  `source`      VARCHAR(50) NULL DEFAULT 'site',
  `status`      ENUM('novo','em_atendimento','convertido','arquivado') NOT NULL DEFAULT 'novo',
  `notes`       TEXT NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_leads_status` (`status`),
  KEY `idx_leads_property` (`property_id`),
  KEY `idx_leads_created` (`created_at`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_leads_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- PROSPECTS (Prospecção: proprietários que querem vender)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `prospects` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`           VARCHAR(100) NOT NULL,
  `email`          VARCHAR(150) NULL,
  `phone`          VARCHAR(30) NULL,
  `property_type`  VARCHAR(30) NULL,
  `city`           VARCHAR(100) NULL,
  `neighborhood`   VARCHAR(100) NULL,
  `expected_price` DECIMAL(15,2) NULL,
  `message`        TEXT NULL,
  `source`         VARCHAR(50) NULL DEFAULT 'site',
  `status`         ENUM('novo','em_contato','avaliacao','captado','arquivado') NOT NULL DEFAULT 'novo',
  `notes`          TEXT NULL,
  `created_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_prospects_status` (`status`),
  KEY `idx_prospects_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- PAYMENTS (faturas do Stripe)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- BANNERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `banners` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`         VARCHAR(200) NULL,
  `subtitle`      VARCHAR(400) NULL,
  `image_path`    VARCHAR(500) NOT NULL,
  `button_text`   VARCHAR(100) NULL,
  `button_link`   VARCHAR(500) NULL,
  `active`        TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- SITE SETTINGS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `site_name`     VARCHAR(100) NOT NULL DEFAULT 'FGR Imóveis',
  `phone`         VARCHAR(30) NULL,
  `whatsapp`      VARCHAR(30) NULL,
  `email`         VARCHAR(150) NULL,
  `instagram`     VARCHAR(100) NULL,
  `facebook`      VARCHAR(200) NULL,
  `youtube`       VARCHAR(200) NULL,
  `address`       VARCHAR(300) NULL,
  `city`          VARCHAR(100) NULL,
  `state`         VARCHAR(2) NULL,
  `about_text`    TEXT NULL,
  `footer_text`   TEXT NULL,
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- AUDIT LOGS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED NULL,
  `action`      VARCHAR(50) NOT NULL,
  `entity`      VARCHAR(50) NOT NULL,
  `entity_id`   INT UNSIGNED NULL,
  `old_data`    JSON NULL,
  `new_data`    JSON NULL,
  `ip`          VARCHAR(45) NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_entity` (`entity`,`entity_id`),
  KEY `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED INICIAL
-- ============================================================

-- Usuário super admin (senha: Admin@123)
INSERT INTO `users` (`name`,`email`,`password`,`role`) VALUES
('Administrador','admin@fgrimoveis.com.br','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','super_admin');

-- Configurações padrão
INSERT INTO `site_settings` (`site_name`,`phone`,`whatsapp`,`email`,`instagram`,`address`,`city`,`state`) VALUES
('FGR Imóveis','(11) 99999-9999','5511999999999','contato@fgrimoveis.com.br','@fgrimoveis','[Endereço a confirmar]','[Cidade]','SP');

-- Características padrão
INSERT INTO `features` (`name`,`icon`) VALUES
('Piscina','waves'),('Churrasqueira','flame'),('Academia','dumbbell'),
('Mobiliado','sofa'),('Ar-condicionado','wind'),('Varanda Gourmet','utensils'),
('Área Gourmet','chef-hat'),('Energia Solar','sun'),('Jardim','trees'),
('Segurança 24h','shield'),('Portaria 24h','door-open'),('Salão de Festas','party-popper'),
('Home Office','laptop'),('Closet','shirt'),('Lareira','flame'),
('Condomínio Fechado','lock'),('Automação Residencial','cpu'),('Sala de Cinema','monitor');

-- Corretor de exemplo
INSERT INTO `agents` (`name`,`phone`,`email`,`creci`,`bio`) VALUES
('Corretor Exemplo','(11) 99999-9999','corretor@fgrimoveis.com.br','CRECI-SP 000000','Corretor especializado em imóveis de alto padrão.');

-- Planos iniciais (o Admin pode editar; preços sobem para o Stripe no primeiro salvamento ou na primeira assinatura)
INSERT IGNORE INTO `plans` (`name`,`slug`,`description`,`price`,`billing_interval`,`trial_days`,`max_listings`,`max_featured`,`features`,`highlighted`,`display_order`) VALUES
('Corretor','corretor','Para corretores autônomos que querem aparecer no portal.',79.00,'month',0,15,1,'Até 15 anúncios ativos\n1 anúncio em destaque\nLeads direto no seu painel\nContato por WhatsApp e formulário',0,1),
('Imobiliária','imobiliaria','Para imobiliárias que querem todo o estoque no portal.',199.00,'month',0,80,5,'Até 80 anúncios ativos\n5 anúncios em destaque\nLeads direto no seu painel\nRelatório mensal de visitas e contatos',1,2),
('Imobiliária Plus','imobiliaria-plus','Estoque ilimitado e mais destaque na busca.',399.00,'month',0,NULL,15,'Anúncios ilimitados\n15 anúncios em destaque\nLeads direto no seu painel\nRelatório mensal de visitas e contatos\nAtendimento prioritário',0,3);
