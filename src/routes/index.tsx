import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { TrendingUp, Mail, Calendar } from "lucide-react";
import { Header } from "@/components/portal/Header";
import { Footer } from "@/components/portal/Footer";
import { FeaturedPost } from "@/components/portal/FeaturedPost";
import { PostCard } from "@/components/portal/PostCard";
import { CategorySection } from "@/components/portal/CategorySection";
import { ColumnistCard } from "@/components/portal/ColumnistCard";
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
  queryFn: () => getLatestPosts({ data: { limit: 12 } }),
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

function HomePage() {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const { data: featuredPost } = useSuspenseQuery(featuredPostQueryOptions);
  const { data: latestPosts } = useSuspenseQuery(latestPostsQueryOptions);
  const { data: mostReadPosts } = useSuspenseQuery(mostReadPostsQueryOptions);
  const { data: columnists } = useSuspenseQuery(columnistsQueryOptions);

  const postsByCategory = categories.map((category) => ({
    category,
    posts: latestPosts.filter((post) => post.categories?.slug === category.slug).slice(0, 4),
  }));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header categories={categories} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              {featuredPost ? (
                <FeaturedPost post={featuredPost} />
              ) : (
                <div className="flex aspect-[21/9] items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  Nenhuma notícia em destaque
                </div>
              )}

              {latestPosts.filter((p) => p.id !== featuredPost?.id).length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  {latestPosts
                    .filter((p) => p.id !== featuredPost?.id)
                    .slice(0, 2)
                    .map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                </div>
              )}
            </div>

            <aside className="space-y-6 lg:col-span-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-card-foreground">Mais lidas</h2>
                </div>
                <div className="space-y-4">
                  {mostReadPosts.map((post, index) => (
                    <div key={post.id} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                      <PostCard post={post} variant="compact" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-primary p-5 text-primary-foreground shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <h2 className="text-lg font-bold">Newsletter</h2>
                </div>
                <p className="mb-4 text-sm text-primary-foreground/80">
                  Receba as principais notícias e análises do mercado condominial toda semana.
                </p>
                <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder="Seu e-mail"
                    className="h-10 rounded-md border border-primary-foreground/20 bg-primary-foreground/10 px-3 text-sm text-primary-foreground placeholder:text-primary-foreground/50 outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/30"
                  />
                  <button
                    type="submit"
                    className="h-10 rounded-md bg-primary-foreground px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary-foreground/90"
                  >
                    Cadastrar
                  </button>
                </form>
              </div>
            </aside>
          </div>

          <section className="py-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Últimas notícias</h2>
              <Link
                to="/categoria/$slug"
                params={{ slug: "noticias" }}
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Ver todas
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latestPosts.slice(0, 4).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>

          {postsByCategory.map(
            ({ category, posts }) =>
              posts.length > 0 && <CategorySection key={category.slug} category={category} posts={posts} />
          )}

          {columnists.length > 0 && (
            <section className="border-t border-border py-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Colunistas</h2>
                <Link
                  to="/colunistas"
                  className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Ver todos
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {columnists.slice(0, 4).map((columnist) => (
                  <ColumnistCard key={columnist.id} columnist={columnist} />
                ))}
              </div>
            </section>
          )}

          <section className="border-t border-border py-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Próximos eventos</h2>
              <Link to="/" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
                Ver agenda
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-muted text-foreground">
                    <span className="text-xs font-semibold uppercase">SET</span>
                    <span className="text-xl font-bold">{10 + i}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Workshop SíndicoLab {i}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      São Paulo • Presencial
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer categories={categories} />
    </div>
  );
}
