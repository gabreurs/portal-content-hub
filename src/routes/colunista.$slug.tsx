import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Linkedin, Instagram, ArrowLeft } from "lucide-react";
import { Header } from "@/components/portal/Header";
import { Footer } from "@/components/portal/Footer";
import { PostCard } from "@/components/portal/PostCard";
import { getCategories } from "@/lib/posts.functions";
import { getColumnistBySlug } from "@/lib/authors.functions";

const categoriesQueryOptions = queryOptions({
  queryKey: ["categories"],
  queryFn: () => getCategories(),
  staleTime: 5 * 60 * 1000,
});

const columnistQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["columnist", slug],
    queryFn: () => getColumnistBySlug({ data: { slug } }),
    staleTime: 5 * 60 * 1000,
  });

export const Route = createFileRoute("/colunista/$slug")({
  loader: async ({ context, params }) => {
    const [, columnist] = await Promise.all([
      context.queryClient.ensureQueryData(categoriesQueryOptions),
      context.queryClient.ensureQueryData(columnistQueryOptions(params.slug)),
    ]);
    return { columnist };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Colunista indisponível — SíndicoLab" }, { name: "robots", content: "noindex" }],
      };
    }
    const author = loaderData.columnist.author;
    const description =
      author.headline || author.bio || `Colunas e análises de ${author.name} no SíndicoLab.`;
    return {
      meta: [
        { title: `${author.name} — Colunista | SíndicoLab` },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: `${author.name} — Colunista | SíndicoLab` },
        { property: "og:description", content: description.slice(0, 155) },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ColumnistPage,
});

function ColumnistPage() {
  const { slug } = Route.useParams();
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const { data } = useSuspenseQuery(columnistQueryOptions(slug));
  const { author, posts } = data;

  const initials = author.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header categories={categories} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/colunistas"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Todos os colunistas
        </Link>

        <header className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-muted">
            {author.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={`Foto de ${author.name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                {initials}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-card-foreground">{author.name}</h1>
            {author.role && <p className="text-sm font-medium text-primary">{author.role}</p>}
            {author.headline && <p className="mt-1 text-muted-foreground">{author.headline}</p>}
            {author.bio && <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{author.bio}</p>}
            <div className="mt-3 flex items-center gap-3">
              {author.linkedin_url && (
                <a
                  href={author.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`LinkedIn de ${author.name}`}
                  className="rounded-md border border-input p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {author.instagram_url && (
                <a
                  href={author.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Instagram de ${author.name}`}
                  className="rounded-md border border-input p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </header>

        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-foreground">Colunas de {author.name}</h2>
          {posts.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma coluna publicada ainda.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer categories={categories} />
    </div>
  );
}
