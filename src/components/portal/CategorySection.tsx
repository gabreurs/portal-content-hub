import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { PostCard } from "./PostCard";

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

interface CategorySectionProps {
  category: {
    slug: string;
    name: string;
    color: string | null;
  };
  posts: Post[];
}

export function CategorySection({ category, posts }: CategorySectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-border py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground" style={{ color: category.color ?? "currentColor" }}>
          {category.name}
        </h2>
        <Link
          to="/categoria/$slug"
          params={{ slug: category.slug }}
          className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Ver mais
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
