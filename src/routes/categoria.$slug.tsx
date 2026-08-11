import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/portal/Header";
import { Footer } from "@/components/portal/Footer";
import { PostCard } from "@/components/portal/PostCard";
import { getCategories, getPostsByCategory } from "@/lib/posts.functions";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  view_count: number;
  categories: { slug: string; name: string; color: string | null } | null;
  authors: { name: string; avatar_url: string | null } | null;
};

const categoriesQueryOptions = queryOptions({
  queryKey: ["categories"],
  queryFn: () => getCategories(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/categoria/$slug")({
  loader: async ({ context, params }) => {
    const categoryQueryOptions = queryOptions({
      queryKey: ["category-posts", params.slug],
      queryFn: () => getPostsByCategory({ data: { categorySlug: params.slug, limit: 24 } }),
      staleTime: 5 * 60 * 1000,
    });

    const [categories, data] = await Promise.all([
      context.queryClient.ensureQueryData(categoriesQueryOptions),
      context.queryClient.ensureQueryData(categoryQueryOptions),
    ]);

    return { slug: params.slug, categories, category: data.category, posts: data.posts };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.category?.name ?? "Categoria";
    return {
      meta: [
        { title: `${name} — SíndicoLab` },
        { name: "description", content: `Notícias e conteúdo sobre ${name} no SíndicoLab.` },
        { property: "og:title", content: `${name} — SíndicoLab` },
        { property: "og:description", content: `Notícias e conteúdo sobre ${name} no SíndicoLab.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Categoria não encontrada</h1>
        <p className="mt-2 text-muted-foreground">A categoria que você procura não existe.</p>
      </div>
    </div>
  ),
});

function CategoryPage() {
  const { category, posts } = Route.useLoaderData();
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);

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

          <div className="mb-8">
            <h1
              className="text-3xl font-bold md:text-4xl"
              style={{ color: category.color ?? "currentColor" }}
            >
              {category.name}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {posts.length} {posts.length === 1 ? "publicação" : "publicações"}
            </p>
          </div>

          {posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {posts.map((post: Post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
              Nenhuma publicação encontrada nesta categoria.
            </div>
          )}
        </div>
      </main>

      <Footer categories={categories} />
    </div>
  );
}
