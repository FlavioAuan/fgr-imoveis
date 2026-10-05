-- ============================================================
-- FGR Imóveis — Imóveis fictícios de exemplo
-- São João da Boa Vista e região
-- Pode ser executado várias vezes (remove os códigos FGR-1xx antes)
-- ============================================================

USE `fgr_imoveis`;

DELETE FROM `properties` WHERE `code` LIKE 'FGR-1__';

INSERT INTO `properties`
  (`code`,`slug`,`title`,`transaction_type`,`property_type`,`status`,`featured`,`price`,`condominium_fee`,`iptu`,
   `area`,`built_area`,`bedrooms`,`suites`,`bathrooms`,`parking_spaces`,`description`,
   `city`,`state`,`neighborhood`,`address`,`zipcode`,`latitude`,`longitude`,`agent_id`,`created_by`)
VALUES
('FGR-101','casa-condominio-vista-serra-mantiqueira','Casa em Condomínio com Vista para a Serra da Mantiqueira','venda','casa','disponivel',1,
 1850000,650,4800,600,320,4,3,5,4,
 'Casa térrea de alto padrão em condomínio fechado, com vista privilegiada para a Serra da Mantiqueira. Ambientes integrados com pé-direito alto, cozinha planejada, área gourmet com churrasqueira, piscina aquecida e amplo jardim. Segurança 24 horas e a tranquilidade do interior a poucos minutos do centro.',
 'São João da Boa Vista','SP','Condomínio Residencial Mantiqueira','Alameda das Paineiras, 120','13874-000',-21.95810000,-46.78120000,1,1),

('FGR-102','sobrado-moderno-jardim-recreio','Sobrado Moderno no Jardim Recreio','venda','casa','disponivel',1,
 980000,NULL,2600,360,240,3,1,3,2,
 'Sobrado com arquitetura contemporânea, acabamento de primeira e muita iluminação natural. Sala em dois ambientes, cozinha americana, varanda gourmet e quintal com espaço para piscina. Bairro residencial, próximo a escolas, padarias e supermercados.',
 'São João da Boa Vista','SP','Jardim Recreio','Rua dos Ipês, 455','13872-000',-21.97520000,-46.79380000,1,1),

('FGR-103','casa-terrea-centro-historico','Casa Térrea Reformada a Duas Quadras da Catedral','venda','casa','disponivel',1,
 690000,NULL,1900,300,190,3,1,2,2,
 'Casa térrea totalmente reformada, mantendo o charme das construções antigas da cidade. A duas quadras da Praça da Catedral e do Theatro Municipal, com fácil acesso a comércio, bancos e serviços. Pisos de madeira restaurados, cozinha nova e edícula nos fundos.',
 'São João da Boa Vista','SP','Centro','Rua Saldanha Marinho, 210','13870-000',-21.96930000,-46.79790000,1,1),

('FGR-104','casa-tres-dormitorios-vila-conrado','Casa de 3 Dormitórios com Quintal Amplo','venda','casa','disponivel',0,
 450000,NULL,1200,250,140,3,1,2,2,
 'Casa aconchegante em rua tranquila, ideal para famílias. Sala ampla, cozinha com armários, área de serviço coberta e quintal gramado com churrasqueira. Ótima opção para quem quer sair do aluguel.',
 'São João da Boa Vista','SP','Vila Conrado','Rua Antônio Prado, 78','13871-000',-21.96420000,-46.80510000,1,1),

('FGR-105','casa-aluguel-jardim-primavera','Casa para Alugar no Jardim Primavera','aluguel','casa','disponivel',0,
 3200,NULL,1100,280,170,3,1,2,2,
 'Casa bem conservada, com sala de estar e jantar, cozinha planejada, três dormitórios (um suíte) e garagem coberta para dois carros. Quintal com área gourmet. Disponível para locação imediata.',
 'São João da Boa Vista','SP','Jardim Primavera','Rua das Hortênsias, 340','13873-000',-21.98110000,-46.78890000,1,1),

('FGR-106','chacara-aguas-da-prata','Chácara com Casa Sede e Nascente em Águas da Prata','venda','casa','disponivel',1,
 1250000,NULL,2100,20000,280,4,2,4,6,
 'Chácara de 2 hectares cercada pela natureza da Serra, com casa sede ampla, lareira, varanda em toda a volta, pomar formado, nascente e lago. Perfeita para morar ou como refúgio de fim de semana, a poucos minutos do centro de Águas da Prata.',
 'Águas da Prata','SP','Zona Rural','Estrada Municipal da Prata, km 4','13890-000',-21.93210000,-46.71840000,1,1),

('FGR-107','casa-condominio-vargem-grande-do-sul','Casa em Condomínio Fechado em Vargem Grande do Sul','venda','condominio','disponivel',0,
 790000,480,2300,450,220,3,2,3,3,
 'Casa nova em condomínio com portaria 24h, salão de festas e área verde. Projeto moderno com sala integrada à cozinha, espaço gourmet e piscina. Lote plano com jardim frontal e fundos.',
 'Vargem Grande do Sul','SP','Residencial Bela Vista','Rua das Magnólias, 55','13880-000',-21.83140000,-46.89270000,1,1),

('FGR-108','casa-aluguel-espirito-santo-do-pinhal','Casa Ampla para Alugar no Centro de Pinhal','aluguel','casa','disponivel',0,
 2500,NULL,900,320,200,4,1,3,2,
 'Casa espaçosa no centro de Espírito Santo do Pinhal, próxima ao comércio e às escolas. Quatro dormitórios, escritório, copa, cozinha grande e quintal arborizado. Ótima para famílias grandes.',
 'Espírito Santo do Pinhal','SP','Centro','Rua General Osório, 600','13990-000',-22.19090000,-46.74770000,1,1);

-- ------------------------------------------------------------
-- Fotos (a primeira de cada imóvel é a capa)
-- ------------------------------------------------------------
INSERT INTO `property_images` (`property_id`,`image_path`,`display_order`,`is_cover`)
SELECT p.id, i.url, i.ord, i.ord = 0
FROM `properties` p
JOIN (
  SELECT 'FGR-101' code, 0 ord, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=80' url UNION ALL
  SELECT 'FGR-101', 1, 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1600&q=80' UNION ALL
  SELECT 'FGR-101', 2, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80' UNION ALL
  SELECT 'FGR-102', 0, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80' UNION ALL
  SELECT 'FGR-102', 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80' UNION ALL
  SELECT 'FGR-102', 2, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80' UNION ALL
  SELECT 'FGR-103', 0, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&q=80' UNION ALL
  SELECT 'FGR-103', 1, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1600&q=80' UNION ALL
  SELECT 'FGR-103', 2, 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1600&q=80' UNION ALL
  SELECT 'FGR-104', 0, 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1600&q=80' UNION ALL
  SELECT 'FGR-104', 1, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&q=80' UNION ALL
  SELECT 'FGR-105', 0, 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1600&q=80' UNION ALL
  SELECT 'FGR-105', 1, 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1600&q=80' UNION ALL
  SELECT 'FGR-106', 0, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80' UNION ALL
  SELECT 'FGR-106', 1, 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=80' UNION ALL
  SELECT 'FGR-107', 0, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80' UNION ALL
  SELECT 'FGR-107', 1, 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1600&q=80' UNION ALL
  SELECT 'FGR-108', 0, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80' UNION ALL
  SELECT 'FGR-108', 1, 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=1600&q=80'
) i ON i.code = p.code;

-- ------------------------------------------------------------
-- Características
-- ------------------------------------------------------------
INSERT INTO `property_features` (`property_id`,`feature_id`)
SELECT p.id, f.id
FROM `properties` p
JOIN (
  SELECT 'FGR-101' code, 'Piscina' feat UNION ALL SELECT 'FGR-101','Área Gourmet' UNION ALL
  SELECT 'FGR-101','Condomínio Fechado' UNION ALL SELECT 'FGR-101','Segurança 24h' UNION ALL
  SELECT 'FGR-101','Energia Solar' UNION ALL SELECT 'FGR-101','Jardim' UNION ALL
  SELECT 'FGR-102','Varanda Gourmet' UNION ALL SELECT 'FGR-102','Churrasqueira' UNION ALL
  SELECT 'FGR-102','Closet' UNION ALL SELECT 'FGR-102','Ar-condicionado' UNION ALL
  SELECT 'FGR-103','Home Office' UNION ALL SELECT 'FGR-103','Jardim' UNION ALL
  SELECT 'FGR-104','Churrasqueira' UNION ALL SELECT 'FGR-104','Jardim' UNION ALL
  SELECT 'FGR-105','Área Gourmet' UNION ALL SELECT 'FGR-105','Churrasqueira' UNION ALL
  SELECT 'FGR-106','Lareira' UNION ALL SELECT 'FGR-106','Piscina' UNION ALL
  SELECT 'FGR-106','Churrasqueira' UNION ALL SELECT 'FGR-106','Jardim' UNION ALL
  SELECT 'FGR-107','Condomínio Fechado' UNION ALL SELECT 'FGR-107','Portaria 24h' UNION ALL
  SELECT 'FGR-107','Salão de Festas' UNION ALL SELECT 'FGR-107','Piscina' UNION ALL
  SELECT 'FGR-108','Home Office' UNION ALL SELECT 'FGR-108','Jardim'
) x ON x.code = p.code
JOIN `features` f ON f.name = x.feat;
