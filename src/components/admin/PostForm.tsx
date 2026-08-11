import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Save, Loader2 } from "lucide-react";
import { createPost, updatePost } from "@/lib/posts.functions";

interface Author {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface PostFormProps {
  initial?: {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    categoryId: string;
    authorId: string;
    featured: boolean;
    published: boolean;
    publishedAt: string;
  };
  categories: Category[];
  authors: Author[];
}

export function PostForm({ initial, categories, authors }: PostFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    coverImage: initial?.coverImage ?? "",
    categoryId: initial?.categoryId ?? "",
    authorId: initial?.authorId ?? "",
    featured: initial?.featured ?? false,
    published: initial?.published ?? false,
    publishedAt: initial?.publishedAt
      ? new Date(initial.publishedAt).toISOString().slice(0, 16)
      : "",
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80);
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug && prev.title ? prev.slug : generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (initial?.id) {
        await updatePost({
          data: {
            id: initial.id,
            title: form.title,
            slug: form.slug,
            excerpt: form.excerpt,
            content: form.content,
            coverImage: form.coverImage,
            categoryId: form.categoryId,
            authorId: form.authorId,
            featured: form.featured,
            published: form.published,
            publishedAt: form.publishedAt,
          },
        });
      } else {
        await createPost({
          data: {
            title: form.title,
            slug: form.slug,
            excerpt: form.excerpt,
            content: form.content,
            coverImage: form.coverImage,
            categoryId: form.categoryId,
            authorId: form.authorId,
            featured: form.featured,
            published: form.published,
            publishedAt: form.publishedAt,
          },
        });
      }
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar notícia");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Título
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Título da notícia"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium text-foreground">
            Slug
          </label>
          <input
            id="slug"
            type="text"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            required
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="slug-da-noticia"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="publishedAt" className="text-sm font-medium text-foreground">
            Data de publicação
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="publishedAt"
              type="datetime-local"
              value={form.publishedAt}
              onChange={(e) => setForm((prev) => ({ ...prev, publishedAt: e.target.value }))}
              className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="categoryId" className="text-sm font-medium text-foreground">
            Categoria
          </label>
          <select
            id="categoryId"
            value={form.categoryId}
            onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Selecione</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="authorId" className="text-sm font-medium text-foreground">
            Autor
          </label>
          <select
            id="authorId"
            value={form.authorId}
            onChange={(e) => setForm((prev) => ({ ...prev, authorId: e.target.value }))}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Selecione</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="coverImage" className="text-sm font-medium text-foreground">
            URL da imagem de capa
          </label>
          <input
            id="coverImage"
            type="url"
            value={form.coverImage}
            onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="https://exemplo.com/imagem.jpg"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="excerpt" className="text-sm font-medium text-foreground">
            Resumo
          </label>
          <textarea
            id="excerpt"
            value={form.excerpt}
            onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Breve resumo da notícia"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="content" className="text-sm font-medium text-foreground">
            Conteúdo
          </label>
          <textarea
            id="content"
            value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            rows={12}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Conteúdo completo da notícia"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
            className="h-4 w-4 rounded border-border text-primary"
          />
          Destaque na home
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
            className="h-4 w-4 rounded border-border text-primary"
          />
          Publicado
        </label>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {initial?.id ? "Salvar alterações" : "Publicar notícia"}
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/admin" })}
          className="h-11 rounded-md border border-input bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
