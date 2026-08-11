# FGR Imóveis — Instruções de Configuração

## Como adicionar o logo

Coloque os arquivos do logo em:

```
public/images/logo.png        ← Logo para fundo claro (header)
public/images/logo-white.png  ← Logo para fundo escuro (footer) — versão branca
```

Enquanto o logo não estiver disponível, o site exibe um logo SVG gerado automaticamente.

## Como alterar os dados da empresa

Edite o arquivo:

```
src/lib/config.ts
```

Nele estão centralizados:
- Nome da empresa
- Número de WhatsApp
- Telefone
- E-mail
- Instagram
- Endereço
- Horário de atendimento

## Como rodar o projeto

```bash
# Instalar dependências (já instaladas)
npm install

# Rodar em desenvolvimento
npm run dev
# Acesse: http://localhost:3000

# Gerar build de produção
npm run build
npm run start
```

## Como adicionar imóveis

Os imóveis fictícios estão em:

```
src/data/properties.ts
```

Adicione novos imóveis seguindo o mesmo formato. Cada imóvel tem:
- id, slug, code, title, description
- type: casa | apartamento | cobertura | studio | terreno | comercial | condominio
- transaction: venda | aluguel
- status: disponivel | vendido | alugado | reservado
- price, condoFee, iptu
- location: address, neighborhood, city, state, zipCode, coordinates
- area, bedrooms, suites, bathrooms, parkingSpaces
- features: lista de características
- images: lista de URLs das fotos
- featured: true/false

## Estrutura do projeto

```
src/
  app/                    ← Páginas (Next.js App Router)
    page.tsx              ← Home
    imoveis/
      page.tsx            ← Listagem de imóveis
      [slug]/page.tsx     ← Página individual do imóvel
    sobre/page.tsx
    venda-seu-imovel/page.tsx
    contato/page.tsx
    sitemap.ts
    robots.ts

  components/
    layout/
      Header.tsx          ← Cabeçalho com navegação
      Footer.tsx          ← Rodapé
      WhatsAppButton.tsx  ← Botão flutuante WhatsApp
    home/
      Hero.tsx            ← Seção hero com busca
      FeaturedProperties.tsx
      TrustSection.tsx
      Categories.tsx
      SellProperty.tsx
      WhatsAppCTA.tsx
    properties/
      PropertyCard.tsx    ← Card de imóvel
      PropertyFilters.tsx ← Sistema de filtros
      PropertyGallery.tsx ← Galeria com lightbox
      PropertyContactForm.tsx
    ui/
      Button.tsx
      Input.tsx
      Select.tsx
      Textarea.tsx
      Logo.tsx
      InstagramIcon.tsx

  data/
    properties.ts         ← Dados dos imóveis (substituir por API futuramente)

  lib/
    config.ts             ← Configurações globais
    utils.ts              ← Funções utilitárias

  types/
    property.ts           ← Tipos TypeScript
```

## Integrações futuras

- **Banco de dados**: substitua `src/data/properties.ts` por chamadas à API/Supabase
- **Formulários**: integre com seu backend/email nos formulários de contato e venda
- **Mapa**: adicione Google Maps ou Mapbox na página do imóvel
- **Painel admin**: a arquitetura já está pronta para adicionar autenticação e CRUD
