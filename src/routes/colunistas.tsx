import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Header } from "@/components/portal/Header";
import { Footer } from "@/components/portal/Footer";
import { ColumnistCard } from "@/components/portal/ColumnistCard";
import { PostCard } from "@/components/portal/PostCard";
import { getCategories } from "@/lib/posts.functions";
import { getColumnists, getLatestColumns } from "@/lib/authors.functions";

const categoriesQueryOptions = queryOptions({
  queryKey: ["categories"],
  queryFn: () => getCategories(),
  staleTime: 5 * 60 * 1000,
});

const columnistsQueryOptions = queryOptions({
  queryKey: ["columnists"],
  queryFn: () => getColumnists(),
  staleTime: 5 * 60 * 1000,
});

const latestColumnsQueryOptions = queryOptions({
  queryKey: ["latest-columns", 6],
  queryFn: () => getLatestColumns({ data: { limit: 6 } }),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/colunistas")({
  head: () => ({
    meta: [
      { title: "Colunistas — SíndicoLab" },
      {
        name: "description",
        content:
          "Conheça os colunistas do SíndicoLab: especialistas em gestão condominial, direito, mercado imobiliário e convivência.",
      },
      { property: "og:title", content: "Colunistas — SíndicoLab" },
      {
        property: "og:description",
        content: "Análises e opinião dos principais especialistas do universo condominial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQueryOptions),
      context.queryClient.ensureQueryData(columnistsQueryOptions),
      context.queryClient.ensureQueryData(latestColumnsQueryOptions),
    ]);
  },
  component: ColumnistsPage,
});

function ColumnistsPage() {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const { data: columnists } = useSuspenseQuery(columnistsQueryOptions);
  const { data: columns } = useSuspenseQuery(latestColumnsQueryOptions);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header categories={categories} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Colunistas</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Especialistas que analisam o dia a dia dos condomínios: gestão, legislação, finanças e convivência.
          </p>
        </header>

        {columnists.length === 0 ? (
          <p className="text-muted-foreground">Nenhum colunista cadastrado ainda.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {columnists.map((columnist) => (
              <ColumnistCard key={columnist.id} columnist={columnist} />
            ))}
          </div>
        )}

        {columns.length > 0 && (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="mb-4 text-xl font-bold text-foreground">Últimas colunas</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {columns.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer categories={categories} />
    </div>
  );
}
