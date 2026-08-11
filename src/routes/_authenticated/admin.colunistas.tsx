import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import {
  getAllColumnistsAdmin,
  createColumnist,
  updateColumnist,
  deleteColumnist,
} from "@/lib/authors.functions";

type ColumnistRow = {
  id: string;
  slug: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  role: string | null;
  headline: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  sort_order: number;
  active: boolean;
  is_columnist: boolean;
};

const adminColumnistsQueryOptions = queryOptions({
  queryKey: ["admin-columnists"],
  queryFn: () => getAllColumnistsAdmin(),
  staleTime: 0,
});

function generateSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const Route = createFileRoute("/_authenticated/admin/colunistas")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(adminColumnistsQueryOptions);
  },
  head: () => ({
    meta: [
      { title: "Colunistas — Painel SíndicoLab" },
      { name: "description", content: "Cadastre e edite os colunistas do portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminColumnistsPage,
});

const emptyForm = {
  id: "",
  name: "",
  slug: "",
  role: "",
  headline: "",
  bio: "",
  avatarUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  sortOrder: 0,
  active: true,
};

function AdminColumnistsPage() {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(adminColumnistsQueryOptions);
  const columnists = data as ColumnistRow[];
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-columnists"] });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name,
      slug: form.slug || generateSlug(form.name),
      role: form.role,
      headline: form.headline,
      bio: form.bio,
      avatarUrl: form.avatarUrl,
      linkedinUrl: form.linkedinUrl,
      instagramUrl: form.instagramUrl,
      sortOrder: Number(form.sortOrder) || 0,
      isColumnist: true,
      active: form.active,
    };
    try {
      if (form.id) {
        await updateColumnist({ data: { ...payload, id: form.id } });
      } else {
        await createColumnist({ data: payload });
      }
      setForm(emptyForm);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar colunista");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (columnist: ColumnistRow) => {
    setForm({
      id: columnist.id,
      name: columnist.name,
      slug: columnist.slug,
      role: columnist.role ?? "",
      headline: columnist.headline ?? "",
      bio: columnist.bio ?? "",
      avatarUrl: columnist.avatar_url ?? "",
      linkedinUrl: columnist.linkedin_url ?? "",
      instagramUrl: columnist.instagram_url ?? "",
      sortOrder: columnist.sort_order,
      active: columnist.active,
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Remover este colunista?")) return;
    try {
      await deleteColumnist({ data: { id } });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover colunista");
    }
  };

  const inputClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/admin"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao painel
        </Link>

        <h1 className="text-2xl font-bold text-foreground">Colunistas</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Cadastre os colunistas e vincule notícias a eles ao criar uma publicação.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mb-10 grid gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Nome *</label>
            <input
              className={inputClass}
              required
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value,
                  slug: f.id ? f.slug : generateSlug(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Slug *</label>
            <input
              className={inputClass}
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Cargo / especialidade</label>
            <input
              className={inputClass}
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Foto (URL)</label>
            <input
              className={inputClass}
              value={form.avatarUrl}
              onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-card-foreground">Frase de destaque</label>
            <input
              className={inputClass}
              value={form.headline}
              onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-card-foreground">Biografia</label>
            <textarea
              rows={4}
              className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">LinkedIn</label>
            <input
              className={inputClass}
              value={form.linkedinUrl}
              onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Instagram</label>
            <input
              className={inputClass}
              value={form.instagramUrl}
              onChange={(e) => setForm((f) => ({ ...f, instagramUrl: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Ordem</label>
            <input
              type="number"
              className={inputClass}
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            />
          </div>
          <label className="flex items-center gap-2 self-end text-sm text-card-foreground">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            Ativo no portal
          </label>

          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}

          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {form.id ? "Salvar alterações" : "Adicionar colunista"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm(emptyForm)}
                className="h-10 rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Colunista</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-foreground md:table-cell">Cargo</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {columnists.map((columnist) => (
                <tr key={columnist.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{columnist.name}</div>
                    <div className="text-xs text-muted-foreground">/{columnist.slug}</div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {columnist.role ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {columnist.is_columnist ? (columnist.active ? "Colunista ativo" : "Inativo") : "Autor"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(columnist)}
                        className="rounded-md border border-input p-2 text-foreground transition-colors hover:bg-accent"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(columnist.id)}
                        className="rounded-md border border-input p-2 text-destructive transition-colors hover:bg-accent"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {columnists.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum colunista cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
