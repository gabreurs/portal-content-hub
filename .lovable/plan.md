# Plano: Portal de Notícias para Condomínios (MVP)

## Visão geral
Construir um portal editorial estilo SíndicoLab, focado em condomínios, com home, notícias, categorias e um painel administrativo próprio para publicar conteúdo. O MVP não inclui vídeos, podcasts, eventos, newsletter, parceiros ou colunistas — essas seções entram em fases futuras.

## O que será entregue no MVP
- Home com destaque principal, grid de notícias recentes e listagem por categorias.
- Página de categoria (`/noticias`, `/sindicos`, `/moradores`, `/mercado`, `/direito`, `/manutencao`).
- Página individual de notícia com SEO (`/noticia/$slug`).
- Painel admin protegido por login (`/admin`) para criar, editar e publicar notícias.
- Banco de dados com tabelas de notícias, categorias, autores e destaques.
- Seed com notícias de exemplo para o portal já nascer preenchido.

## Backend e banco de dados
- Habilitar **Lovable Cloud** (banco PostgreSQL + autenticação integrada).
- Criar migration com as tabelas:
  - `categories` (slug, nome, cor, ordem, ativo).
  - `authors` (nome, avatar, bio, cargo).
  - `posts` (título, slug, resumo, conteúdo, imagem de capa, categoria, autor, destaque, publicado, data de publicação, visualizações).
- Configurar RLS e GRANTS para que:
  - Visitantes anônimos leiam posts publicados e categorias ativas.
  - Usuários autenticados no painel admin possam criar/editar posts.
- Criar server functions para listar posts, buscar post por slug, criar e atualizar posts.

## Painel administrativo
- Rota `/admin` protegida por autenticação.
- Tela de login integrada ao Lovable Cloud Auth.
- Dashboard admin com lista de notícias, status (rascunho/publicado) e ações.
- Formulário de criação/edição de notícia com:
  - Título, slug automático, resumo, conteúdo (rich text simples), imagem de capa.
  - Seleção de categoria e autor.
  - Checkbox "Destaque na home" e "Publicado".
  - Data de publicação.

## Frontend do portal
- Substituir a página placeholder `src/routes/index.tsx` por uma home completa.
- Header com logo, menu de categorias e busca (visual no MVP, funcionalidade futura).
- Layout de destaque principal + grid de notícias + sidebar "Mais lidas" (baseado em visualizações).
- Footer institucional simples.
- SEO por rota: título, descrição, og:title, og:description e twitter:card.

## Seed de conteúdo inicial
- Inserir 6 a 8 notícias de exemplo sobre gestão condominial, direito, manutenção e finanças.
- Inserir 6 categorias: Notícias, Síndicos, Moradores, Mercado, Direito, Manutenção.
- Inserir 2 a 3 autores de exemplo.
- Marcar 1 notícia como destaque principal.

## Como você alimentará o portal
1. Acesse `/admin` e faça login.
2. No dashboard, clique em "Nova notícia".
3. Preencha título, resumo, conteúdo, escolha a categoria e o autor, faça upload da imagem de capa.
4. Marque "Publicado" e, se quiser, "Destaque na home".
5. Salve. A notícia aparece automaticamente na home, na categoria correta e na página individual.

## Etapas de implementação
1. Habilitar Lovable Cloud e configurar autenticação.
2. Criar migration do banco (categorias, autores, posts) com RLS, GRANTS e seed.
3. Criar server functions para leitura e escrita de posts.
4. Criar layout do portal (header, footer, home).
5. Criar páginas de categoria e notícia individual.
6. Criar painel admin com login, lista e formulário de notícias.
7. Testar fluxo de publicação end-to-end e ajustar SEO.
