import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye } from "lucide-react";
import { CoverImage } from "./CoverImage";

interface FeaturedPostProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image: string | null;
    published_at: string | null;
    view_count: number;
    categories: {
      slug: string;
      name: string;
      color: string | null;
    } | null;
    authors: {
      name: string;
      avatar_url: string | null;
    } | null;
  };
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  const date = post.published_at
    ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true, locale: ptBR })
    : "";

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-card shadow-sm">
      <Link
        to="/noticia/$slug"
        params={{ slug: post.slug }}
        className="relative block aspect-[16/9] overflow-hidden md:aspect-[21/9]"
      >
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            <span>Sem imagem</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </Link>

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
        {post.categories && (
          <Link
            to="/categoria/$slug"
            params={{ slug: post.categories.slug }}
            className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground"
          >
            {post.categories.name}
          </Link>
        )}
        <Link to="/noticia/$slug" params={{ slug: post.slug }}>
          <h2 className="mb-3 text-2xl font-bold leading-tight text-white transition-colors group-hover:text-white/90 md:text-4xl">
            {post.title}
          </h2>
        </Link>
        {post.excerpt && (
          <p className="mb-4 hidden max-w-2xl text-base text-white/80 md:block md:text-lg">
            {post.excerpt}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
          {post.authors && (
            <div className="flex items-center gap-2">
              {post.authors.avatar_url ? (
                <img
                  src={post.authors.avatar_url}
                  alt={post.authors.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                  {post.authors.name.charAt(0)}
                </div>
              )}
              <span>Por {post.authors.name}</span>
            </div>
          )}
          {date && <time>{date}</time>}
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{post.view_count.toLocaleString("pt-BR")}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
