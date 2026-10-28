-- ============================================================
-- Prospecção: proprietários interessados em vender o imóvel
-- Para bancos já instalados. Pode ser executado mais de uma vez.
-- ============================================================

USE `fgr_imoveis`;

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
