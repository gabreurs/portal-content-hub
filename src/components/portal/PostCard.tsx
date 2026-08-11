import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Post {
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
}

interface PostCardProps {
  post: Post;
  variant?: "default" | "horizontal" | "compact";
}

export function PostCard({ post, variant = "default" }: PostCardProps) {
  const date = post.published_at
    ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true, locale: ptBR })
    : "";

  if (variant === "horizontal") {
    return (
      <article className="group flex gap-4">
        <Link
          to="/noticia/$slug"
          params={{ slug: post.slug }}
          className="relative block h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted"
        >
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <span className="text-xs">Sem imagem</span>
            </div>
          )}
        </Link>
        <div className="flex flex-col justify-center">
          {post.categories && (
            <Link
              to="/categoria/$slug"
              params={{ slug: post.categories.slug }}
              className="mb-1 text-xs font-semibold uppercase tracking-wide"
              style={{ color: post.categories.color ?? "currentColor" }}
            >
              {post.categories.name}
            </Link>
          )}
          <Link to="/noticia/$slug" params={{ slug: post.slug }}>
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
              {post.title}
            </h3>
          </Link>
          {date && <time className="mt-1 text-xs text-muted-foreground">{date}</time>}
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group">
        <Link to="/noticia/$slug" params={{ slug: post.slug }} className="block">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
        {date && <time className="mt-1 block text-xs text-muted-foreground">{date}</time>}
      </article>
    );
  }

  return (
    <article className="group flex flex-col">
      <Link
        to="/noticia/$slug"
        params={{ slug: post.slug }}
        className="relative mb-3 block aspect-[16/10] overflow-hidden rounded-xl bg-muted"
      >
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <span className="text-sm">Sem imagem</span>
          </div>
        )}
      </Link>
      {post.categories && (
        <Link
          to="/categoria/$slug"
          params={{ slug: post.categories.slug }}
          className="mb-2 text-xs font-semibold uppercase tracking-wide"
          style={{ color: post.categories.color ?? "currentColor" }}
        >
          {post.categories.name}
        </Link>
      )}
      <Link to="/noticia/$slug" params={{ slug: post.slug }}>
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h3>
      </Link>
      {post.excerpt && (
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
      )}
      <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
        {post.authors && <span>{post.authors.name}</span>}
        {post.authors && date && <span>•</span>}
        {date && <time>{date}</time>}
      </div>
    </article>
  );
}
