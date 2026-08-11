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
    <article className="surface-card group relative h-full overflow-hidden rounded-xl">
      <Link
        to="/noticia/$slug"
        params={{ slug: post.slug }}
        className="relative block aspect-[16/10] h-full overflow-hidden md:aspect-[4/3]"

      >
        <CoverImage
          src={post.cover_image}
          alt={post.title}
          loading="eager"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </Link>

      <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-6">
        {post.categories && (
          <Link
            to="/categoria/$slug"
            params={{ slug: post.categories.slug }}
            className="mb-3 inline-block rounded-md bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground"
          >
            {post.categories.name}
          </Link>
        )}
        <Link to="/noticia/$slug" params={{ slug: post.slug }}>
          <h2 className="mb-2 text-xl font-bold leading-tight text-white transition-colors group-hover:text-white/90 md:text-2xl">
            {post.title}
          </h2>
        </Link>
        {post.excerpt && (
          <p className="mb-3 line-clamp-2 max-w-2xl text-sm text-white/80">
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
