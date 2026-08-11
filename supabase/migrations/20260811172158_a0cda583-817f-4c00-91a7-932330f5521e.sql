-- Criação do enum de papéis
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

-- Tabela de papéis de usuários (criada antes da função que a consulta)
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar papel do usuário
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policies de user_roles (após a função existir)
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Tabela de categorias
CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    name text NOT NULL,
    color text,
    sort_order int NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (active = true);

CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabela de autores/colunistas
CREATE TABLE public.authors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    avatar_url text,
    bio text,
    role text,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.authors TO anon;
GRANT SELECT ON public.authors TO authenticated;
GRANT ALL ON public.authors TO service_role;

ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active authors"
ON public.authors
FOR SELECT
TO anon, authenticated
USING (active = true);

CREATE POLICY "Admins can manage authors"
ON public.authors
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabela de notícias/posts
CREATE TABLE public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    excerpt text,
    content text,
    cover_image text,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    author_id uuid REFERENCES public.authors(id) ON DELETE SET NULL,
    featured boolean NOT NULL DEFAULT false,
    published boolean NOT NULL DEFAULT false,
    published_at timestamptz,
    view_count int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published posts"
ON public.posts
FOR SELECT
TO anon, authenticated
USING (published = true AND published_at <= now());

CREATE POLICY "Admins and editors can manage posts"
ON public.posts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- Seed de categorias
INSERT INTO public.categories (slug, name, color, sort_order) VALUES
('noticias', 'Notícias', '#3B82F6', 1),
('sindicos', 'Síndicos', '#10B981', 2),
('moradores', 'Moradores', '#F59E0B', 3),
('mercado', 'Mercado', '#EF4444', 4),
('direito', 'Direito', '#8B5CF6', 5),
('manutencao', 'Manutenção', '#06B6D4', 6);

-- Seed de autores
INSERT INTO public.authors (name, slug, bio, role) VALUES
('Camila Santos', 'camila-santos', 'Jornalista especializada em gestão condominial.', 'Editora'),
('Ricardo Freitas', 'ricardo-freitas', 'Advogado com foco em direito condominial.', 'Colunista'),
('Juliana Duarte', 'juliana-duarte', 'Consultora em administração de condomínios.', 'Colunista');

-- Seed de posts
INSERT INTO public.posts (title, slug, excerpt, content, cover_image, category_id, author_id, featured, published, published_at, view_count)
SELECT
  'Nova lei das assembleias virtuais: o que muda para condomínios',
  'nova-lei-das-assembleias-virtuais',
  'Entenda os principais pontos da Lei 14.309/2022 e os impactos na gestão, participação e segurança jurídica das deliberações.',
  '<p>A <strong>Lei 14.309/2022</strong> trouxe mudanças importantes para as assembleias condominiais realizadas por meio digital. O texto regulamenta a convocação, a participação dos condôminos e a validade das votações.</p><p>Entre os principais pontos estão a necessidade de identificação do participante, a gravação da sessão e a possibilidade de voto por correspondência eletrônica, desde que previsto em convenção ou regulamento.</p><p>Para os síndicos, a lei representa mais agilidade, mas também exige cuidado com a segurança da informação e a guarda dos registros.</p>',
  'https://images.unsplash.com/photo-1560518883-ce09059addba?w=1200&q=80',
  (SELECT id FROM public.categories WHERE slug = 'direito'),
  (SELECT id FROM public.authors WHERE slug = 'ricardo-freitas'),
  true,
  true,
  now() - interval '1 day',
  2450
UNION ALL
SELECT
  'Inadimplência recua pelo 3º mês seguido, aponta índice nacional',
  'inadimplencia-recua-terceiro-mes',
  'Dados do índice nacional mostram queda consistente da inadimplência em condomínios, sinalizando recuperação do setor.',
  '<p>O índice nacional de inadimplência condominial registrou queda pelo terceiro mês consecutivo. Especialistas apontam que a melhora está relacionada à retomada econômica e ao uso de ferramentas de cobrança mais eficientes.</p><p>Síndicos e administradoras destacam a importância da negociação preventiva e da transparência nas finanças do condomínio.</p>',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
  (SELECT id FROM public.categories WHERE slug = 'mercado'),
  (SELECT id FROM public.authors WHERE slug = 'camila-santos'),
  false,
  true,
  now() - interval '2 days',
  1830
UNION ALL
SELECT
  'Elevadores: manutenção preventiva reduz falhas e custos em até 30%',
  'manutencao-preventiva-elevadores',
  'Um cronograma de manutenção preventiva bem estruturado pode reduzir drasticamente as paradas e os gastos com reparos emergenciais.',
  '<p>A manutenção preventiva de elevadores é um investimento que se paga rapidamente. Segundo especialistas, condomínios que adotam revisões periódicas registram queda de até 30% nos custos de reparo.</p><p>O ideal é contar com uma empresa credenciada e manter um laudo técnico atualizado, conforme exigido pela legislação de segurança.</p>',
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
  (SELECT id FROM public.categories WHERE slug = 'manutencao'),
  (SELECT id FROM public.authors WHERE slug = 'juliana-duarte'),
  false,
  true,
  now() - interval '3 days',
  1520
UNION ALL
SELECT
  'Como melhorar a convivência entre moradores e evitar conflitos frequentes',
  'convivencia-entre-moradores',
  'Pequenas ações de comunicação e respeito às regras comuns podem transformar o clima do condomínio.',
  '<p>A convivência em condomínios pode ser desafiadora, mas regras claras e comunicação transparente ajudam a evitar atritos. Especialistas recomendam assembleias participativas, canais de ouvidoria e mediação de conflitos.</p><p>O síndico desempenha papel central como mediador, mas a responsabilidade pela boa convivência é coletiva.</p>',
  'https://images.unsplash.com/photo-1560518883-ce09059addba?w=1200&q=80',
  (SELECT id FROM public.categories WHERE slug = 'moradores'),
  (SELECT id FROM public.authors WHERE slug = 'camila-santos'),
  false,
  true,
  now() - interval '4 days',
  980
UNION ALL
SELECT
  'Checklist mensal do síndico: 15 tarefas que não podem faltar',
  'checklist-mensal-do-sindico',
  'Organize a rotina da gestão condominial com um checklist prático de atenção mensal.',
  '<p>Síndicos profissionais e voluntários podem se beneficiar de um checklist mensal para não perder prazos. Entre as tarefas estão aprovação de despesas, acompanhamento de inadimplência, revisão de contratos e inspeção das áreas comuns.</p><p>A disciplina na rotina evita surpresas e melhora a previsibilidade financeira do condomínio.</p>',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
  (SELECT id FROM public.categories WHERE slug = 'sindicos'),
  (SELECT id FROM public.authors WHERE slug = 'juliana-duarte'),
  false,
  true,
  now() - interval '5 days',
  875
UNION ALL
SELECT
  'Contas de luz em áreas comuns: como reduzir sem perder conforto',
  'reduzir-contas-luz-areas-comuns',
  'Economia de energia nas áreas comuns é possível com iluminação LED, sensores de presença e conscientização dos moradores.',
  '<p>A conta de luz é uma das maiores despesas operacionais dos condomínios. Substituir lâmpadas por LED, instalar sensores de presença e fazer manutenção periódica do sistema elétrico são medidas simples e eficazes.</p><p>Além da economia, essas ações aumentam a sustentabilidade do empreendimento.</p>',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
  (SELECT id FROM public.categories WHERE slug = 'noticias'),
  (SELECT id FROM public.authors WHERE slug = 'camila-santos'),
  false,
  true,
  now() - interval '6 days',
  720;