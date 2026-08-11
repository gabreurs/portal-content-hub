import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus, Edit, Eye, LogOut, LayoutDashboard, FileText, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAllPostsAdmin, getCategories, getAuthors } from "@/lib/posts.functions";

type AdminPost = {
  id: string;
  title: string;
  slug: string;
  featured: boolean;
  published: boolean;
  category_id: string | null;
  author_id: string | null;
};

type Category = { id: string; name: string };
type Author = { id: string; name: string };

const adminPostsQueryOptions = queryOptions({
  queryKey: ["admin-posts"],
  queryFn: () => getAllPostsAdmin(),
  staleTime: 0,
});

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

export const Route = createFileRoute("/_authenticated/admin")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(adminPostsQueryOptions),
      context.queryClient.ensureQueryData(categoriesQueryOptions),
      context.queryClient.ensureQueryData(authorsQueryOptions),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Painel Administrativo — SíndicoLab" },
      { name: "description", content: "Gerencie notícias e conteúdo do SíndicoLab." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const { data: posts } = useSuspenseQuery(adminPostsQueryOptions);
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const { data: authors } = useSuspenseQuery(authorsQueryOptions);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const categoryMap = new Map<string, Category>(
    categories.map((c: Category) => [c.id, c])
  );
  const authorMap = new Map<string, Author>(
    authors.map((a: Author) => [a.id, a])
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-card-foreground">Painel SíndicoLab</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Ver portal
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Notícias</h2>
            <p className="text-sm text-muted-foreground">
              {posts.length} {posts.length === 1 ? "publicação" : "publicações"} no total
            </p>
          </div>
          <div className="flex items-center gap-3">
          <Link
            to="/admin/colunistas"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            <Users className="h-4 w-4" />
            Colunistas
          </Link>
          <Link
            to="/admin/nova"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Nova notícia
          </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Título</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-foreground md:table-cell">
                  Categoria
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold text-foreground md:table-cell">
                  Autor
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(posts as AdminPost[]).map((post) => (
                <tr key={post.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{post.title}</div>
                    <div className="text-xs text-muted-foreground">/{post.slug}</div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {categoryMap.get(post.category_id ?? "")?.name ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {authorMap.get(post.author_id ?? "")?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {post.published ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        Rascunho
                      </span>
                    )}
                    {post.featured && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Destaque
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to="/admin/edit/$id"
                        params={{ id: post.id }}
                        className="inline-flex items-center gap-1 rounded-md border border-input bg-background p-2 text-foreground transition-colors hover:bg-accent"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/noticia/$slug"
                        params={{ slug: post.slug }}
                        className="inline-flex items-center gap-1 rounded-md border border-input bg-background p-2 text-foreground transition-colors hover:bg-accent"
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
              <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">Nenhuma notícia cadastrada</p>
              <p className="text-sm">Comece criando uma nova notícia.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
