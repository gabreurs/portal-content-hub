import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRight, Eye, Mail, Mic, Play } from "lucide-react";
import { Header } from "@/components/portal/Header";
import { Footer } from "@/components/portal/Footer";
import { FeaturedPost } from "@/components/portal/FeaturedPost";
import { PostCard } from "@/components/portal/PostCard";
import { SectionPanel } from "@/components/portal/SectionPanel";
import { CoverImage } from "@/components/portal/CoverImage";
import logoAsset from "@/assets/sindicolab-logo.png.asset.json";
import {
  getCategories,
  getFeaturedPost,
  getLatestPosts,
  getMostReadPosts,
} from "@/lib/posts.functions";
import { getColumnists } from "@/lib/authors.functions";

const categoriesQueryOptions = queryOptions({
  queryKey: ["categories"],
  queryFn: () => getCategories(),
  staleTime: 5 * 60 * 1000,
});

const featuredPostQueryOptions = queryOptions({
  queryKey: ["featured-post"],
  queryFn: () => getFeaturedPost(),
  staleTime: 5 * 60 * 1000,
});

const latestPostsQueryOptions = queryOptions({
  queryKey: ["latest-posts"],
  queryFn: () => getLatestPosts({ data: { limit: 24 } }),
  staleTime: 5 * 60 * 1000,
});

const mostReadPostsQueryOptions = queryOptions({
  queryKey: ["most-read-posts"],
  queryFn: () => getMostReadPosts({ data: { limit: 5 } }),
  staleTime: 5 * 60 * 1000,
});

const columnistsQueryOptions = queryOptions({
  queryKey: ["columnists"],
  queryFn: () => getColumnists(),
  staleTime: 5 * 60 * 1000,
});

const partners = ["GROUP", "PROSEG", "OTIS", "Intelbras", "Condomob", "THOR", "Superlógica"];

const events = [
  { day: "28", month: "MAI", title: "Encontro de Síndicos", place: "São Paulo - SP", time: "08:30 às 17:30" },
  { day: "12", month: "JUN", title: "Webinar: IA na Gestão Condominial", place: "Online", time: "19:00" },
  { day: "26", month: "JUN", title: "Fórum de Direito Condominial", place: "Curitiba - PR", time: "09:00" },
];

const podcasts = [
  { title: "#87 Inadimplência: causas, impactos e soluções", duration: "32:12" },
  { title: "#86 Segurança condominial além da portaria", duration: "27:45" },
  { title: "#85 ESG em condomínios: por onde começar?", duration: "29:18" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SíndicoLab — Notícias e Conteúdo para Condomínios" },
      {
        name: "description",
        content:
          "O principal portal de notícias, colunas, vídeos e eventos para síndicos, moradores e gestores condominiais.",
      },
      { property: "og:title", content: "SíndicoLab — Notícias e Conteúdo para Condomínios" },
      {
        property: "og:description",
        content:
          "O principal portal de notícias, colunas, vídeos e eventos para síndicos, moradores e gestores condominiais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQueryOptions),
      context.queryClient.ensureQueryData(featuredPostQueryOptions),
      context.queryClient.ensureQueryData(latestPostsQueryOptions),
      context.queryClient.ensureQueryData(mostReadPostsQueryOptions),
      context.queryClient.ensureQueryData(columnistsQueryOptions),
    ]);
  },
  component: HomePage,
});

function MoreLink({ slug }: { slug: string }) {
  return (
    <Link
      to="/categoria/$slug"
      params={{ slug }}
      className="flex items-center gap-0.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
    >
      Ver mais <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  );
}

function HomePage() {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const { data: featuredPost } = useSuspenseQuery(featuredPostQueryOptions);
  const { data: latestPosts } = useSuspenseQuery(latestPostsQueryOptions);
  const { data: mostReadPosts } = useSuspenseQuery(mostReadPostsQueryOptions);
  const { data: columnists } = useSuspenseQuery(columnistsQueryOptions);

  const rest = latestPosts.filter((p) => p.id !== featuredPost?.id);
  const heroSide = rest.slice(0, 4);
  const columnCategories = categories.slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header categories={categories} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Ad banner */}
          <a
            id="anuncie"
            href="#"
            className="surface-card flex flex-col items-start gap-4 rounded-xl bg-gradient-to-r from-secondary/60 to-accent/40 p-5 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center gap-4">
              <img src={logoAsset.url} alt="" className="h-10 w-10 rounded-lg object-cover" />
              <div>
                <p className="text-lg font-bold text-foreground">Gestão completa para condomínios</p>
                <p className="text-sm text-muted-foreground">mais eficiência, menos burocracia.</p>
              </div>
            </div>
            <ul className="hidden gap-6 text-sm text-foreground/80 lg:flex">
              <li>✓ Financeiro</li>
              <li>✓ Cobrança</li>
              <li>✓ Assembleias</li>
            </ul>
            <span className="brand-gradient inline-flex items-center gap-1 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              Conheça agora <ChevronRight className="h-4 w-4" />
            </span>
          </a>

          {/* Hero block */}
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              {featuredPost ? (
                <FeaturedPost post={featuredPost} />
              ) : (
                <div className="surface-card flex aspect-[4/3] items-center justify-center rounded-xl text-muted-foreground">
                  Nenhuma notícia em destaque
                </div>
              )}
            </div>

            <div className="space-y-4 lg:col-span-4">
              {heroSide.map((post) => (
                <PostCard key={post.id} post={post} variant="horizontal" />
              ))}
            </div>

            <aside className="lg:col-span-3">
              <SectionPanel title="Mais lidas">
                <ol className="space-y-4">
                  {mostReadPosts.map((post, index) => (
                    <li key={post.id} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                      <div>
                        <Link
                          to="/noticia/$slug"
                          params={{ slug: post.slug }}
                          className="line-clamp-3 text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary"
                        >
                          {post.title}
                        </Link>
                        <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" /> {post.view_count} visualizações
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
                <Link
                  to="/categoria/$slug"
                  params={{ slug: categories[0]?.slug ?? "noticias" }}
                  className="mt-4 block rounded-lg bg-secondary py-2 text-center text-xs font-semibold text-secondary-foreground transition-colors hover:bg-accent"
                >
                  Ver ranking completo
                </Link>
              </SectionPanel>
            </aside>
          </div>

          {/* Category columns */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {columnCategories.map((category) => {
              const posts = latestPosts
                .filter((p) => p.categories?.slug === category.slug)
                .slice(0, 3);
              if (posts.length === 0) return null;
              return (
                <SectionPanel
                  key={category.slug}
                  title={category.name}
                  action={<MoreLink slug={category.slug} />}
                >
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} variant="list" />
                    ))}
                  </div>
                </SectionPanel>
              );
            })}
          </div>

          {/* Colunistas / Vídeos / Podcasts / Eventos */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <SectionPanel
              title="Colunistas"
              action={
                <Link
                  to="/colunistas"
                  className="flex items-center gap-0.5 text-xs font-medium text-primary hover:text-primary/80"
                >
                  Ver mais <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              }
            >
              <ul className="space-y-3">
                {columnists.slice(0, 4).map((columnist) => (
                  <li key={columnist.id}>
                    <Link
                      to="/colunista/$slug"
                      params={{ slug: columnist.slug }}
                      className="group flex items-center gap-3"
                    >
                      <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                        <CoverImage src={columnist.avatar_url} alt={columnist.name} className="h-full w-full object-cover" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground group-hover:text-primary">
                          {columnist.headline ?? "Coluna"}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">{columnist.name}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </SectionPanel>

            <SectionPanel title="Vídeos">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                <CoverImage
                  src={latestPosts[0]?.cover_image ?? null}
                  alt="Vídeo em destaque"
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground">
                    <Play className="h-5 w-5" />
                  </span>
                </span>
                <span className="absolute bottom-2 right-2 rounded bg-foreground/80 px-1.5 py-0.5 text-[10px] font-semibold text-background">
                  11:34
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold leading-snug text-foreground">
                Inteligência Artificial na gestão condominial: como usar com responsabilidade
              </p>
            </SectionPanel>

            <SectionPanel title="Podcasts">
              <ul className="space-y-4">
                {podcasts.map((episode) => (
                  <li key={episode.title} className="flex items-start gap-3">
                    <Mic className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="flex-1 text-sm font-medium leading-snug text-foreground">{episode.title}</span>
                    <span className="text-xs text-muted-foreground">{episode.duration}</span>
                  </li>
                ))}
              </ul>
            </SectionPanel>

            <SectionPanel title="Eventos">
              <ul className="space-y-4">
                {events.map((event) => (
                  <li key={event.title} className="flex items-center gap-3">
                    <span className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <span className="text-sm font-bold leading-none">{event.day}</span>
                      <span className="text-[10px] font-semibold uppercase">{event.month}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">{event.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {event.place} • {event.time}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </SectionPanel>
          </div>

          {/* Parceiros */}
          <div className="surface-card flex flex-wrap items-center gap-x-10 gap-y-4 rounded-xl px-6 py-5">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Parceiros</span>
            {partners.map((partner) => (
              <span key={partner} className="text-sm font-semibold tracking-tight text-foreground/60">
                {partner}
              </span>
            ))}
          </div>

          {/* Newsletter */}
          <div
            id="newsletter"
            className="surface-card grid gap-6 rounded-xl bg-gradient-to-r from-secondary/70 to-accent/40 p-6 md:grid-cols-2 md:items-center"
          >
            <div className="flex items-center gap-4">
              <span className="brand-gradient flex h-14 w-14 items-center justify-center rounded-xl text-primary-foreground">
                <Mail className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold leading-tight text-foreground">
                  Receba as principais notícias do mercado condominial
                </h2>
                <p className="text-sm text-muted-foreground">Conteúdo exclusivo, toda semana, no seu e-mail.</p>
              </div>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="h-11 flex-1 rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                className="brand-gradient h-11 rounded-lg px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Assinar newsletter
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer categories={categories} />
    </div>
  );
}
