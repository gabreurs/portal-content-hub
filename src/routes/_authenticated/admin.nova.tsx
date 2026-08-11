import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, FilePlus } from "lucide-react";
import { PostForm } from "@/components/admin/PostForm";
import { getCategories, getAuthors } from "@/lib/posts.functions";

const categoriesQueryOptions = queryOptions({
  queryKey: ["categories"],
  queryFn: () => getCategories(),
  staleTime: 5 * 60 * 1000,
});

const authorsQueryOptions = queryOptions({
  queryKey: ["authors"],
  queryFn: () => getAuthors(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/_authenticated/admin/nova")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQueryOptions),
      context.queryClient.ensureQueryData(authorsQueryOptions),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Nova notícia — SíndicoLab" },
      { name: "description", content: "Crie uma nova notícia no SíndicoLab." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewPostPage,
});

function NewPostPage() {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const { data: authors } = useSuspenseQuery(authorsQueryOptions);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <FilePlus className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-card-foreground">Nova notícia</h1>
          </div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <PostForm categories={categories} authors={authors} />
        </div>
      </main>
    </div>
  );
}
