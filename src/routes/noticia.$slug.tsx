import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Eye, Facebook, Twitter, Linkedin, Share2 } from "lucide-react";
import { Header } from "@/components/portal/Header";
import { Footer } from "@/components/portal/Footer";
import { PostCard } from "@/components/portal/PostCard";
import {
  getCategories,
  getPostBySlug,
  getLatestPosts,
  incrementViewCount,
} from "@/lib/posts.functions";

const categoriesQueryOptions = queryOptions({
  queryKey: ["categories"],
  queryFn: () => getCategories(),
  staleTime: 5 * 60 * 1000,
});

const latestPostsQueryOptions = queryOptions({
  queryKey: ["latest-posts"],
  queryFn: () => getLatestPosts({ data: { limit: 4 } }),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/noticia/$slug")({
  loader: async ({ context, params }) => {
    const postQueryOptions = queryOptions({
      queryKey: ["post", params.slug],
      queryFn: () => getPostBySlug({ data: { slug: params.slug } }),
      staleTime: 5 * 60 * 1000,
    });

    const [categories, post, latestPosts] = await Promise.all([
      context.queryClient.ensureQueryData(categoriesQueryOptions),
      context.queryClient.ensureQueryData(postQueryOptions),
      context.queryClient.ensureQueryData(latestPostsQueryOptions),
    ]);

    return { slug: params.slug, categories, post, latestPosts };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.post?.title ?? "Notícia";
    const description = loaderData?.post?.excerpt ?? "Leia a notícia completa no SíndicoLab.";
    return {
      meta: [
        { title: `${title} — SíndicoLab` },
        { name: "description", content: description },
        { property: "og:title", content: `${title} — SíndicoLab` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        ...(loaderData?.post?.cover_image
          ? [{ property: "og:image", content: loaderData.post.cover_image }]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: PostPage,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Erro ao carregar notícia</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
});

function PostPage() {
  const { post } = Route.useLoaderData();
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const { data: latestPosts } = useSuspenseQuery(latestPostsQueryOptions);

  useEffect(() => {
    if (post?.id) {
      void incrementViewCount({ data: { id: post.id } });
    }
  }, [post?.id]);

  const date = post.published_at
    ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true, locale: ptBR })
    : "";

  const related = latestPosts.filter((p) => p.id !== post.id).slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header categories={categories} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para home
          </Link>

          {post.categories && (
            <Link
              to="/categoria/$slug"
              params={{ slug: post.categories.slug }}
              className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground"
            >
              {post.categories.name}
            </Link>
          )}

          <h1 className="max-w-4xl text-3xl font-bold leading-tight text-foreground md:text-5xl">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {post.authors && (
              <div className="flex items-center gap-2">
                {post.authors.avatar_url ? (
                  <img
                    src={post.authors.avatar_url}
                    alt={post.authors.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
                    {post.authors.name.charAt(0)}
                  </div>
                )}
                <span className="font-medium text-foreground">{post.authors.name}</span>
              </div>
            )}
            {date && <time>{date}</time>}
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{post.view_count.toLocaleString("pt-BR")} visualizações</span>
            </div>
          </div>

          {post.cover_image && (
            <div className="mt-8 overflow-hidden rounded-2xl">
              <img src={post.cover_image} alt={post.title} className="w-full object-cover" />
            </div>
          )}

          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <article className="lg:col-span-8">
              {post.excerpt && (
                <p className="mb-6 text-lg font-medium leading-relaxed text-foreground/80">
                  {post.excerpt}
                </p>
              )}
              <div className="prose prose-lg max-w-none text-foreground/90">
                {post.content ? (
                  <div
                    className="leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                ) : (
                  <p className="text-muted-foreground">Conteúdo completo em breve.</p>
                )}
              </div>

              <div className="mt-10 flex items-center gap-3 border-t border-border pt-6">
                <span className="text-sm font-medium text-muted-foreground">Compartilhar:</span>
                <button
                  type="button"
                  className="rounded-full bg-[#1877F2] p-2 text-white transition-opacity hover:opacity-90"
                  aria-label="Compartilhar no Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[#1DA1F2] p-2 text-white transition-opacity hover:opacity-90"
                  aria-label="Compartilhar no Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[#0A66C2] p-2 text-white transition-opacity hover:opacity-90"
                  aria-label="Compartilhar no LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-full bg-muted p-2 text-foreground transition-colors hover:bg-accent"
                  aria-label="Copiar link"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </article>

            <aside className="space-y-8 lg:col-span-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-card-foreground">Leia também</h3>
                <div className="space-y-4">
                  {related.map((p) => (
                    <PostCard key={p.id} post={p} variant="horizontal" />
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-3 text-lg font-bold text-card-foreground">Newsletter</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Receba as principais notícias do mercado condominial.
                </p>
                <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder="Seu e-mail"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <button
                    type="submit"
                    className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Cadastrar
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer categories={categories} />
    </div>
  );
}
