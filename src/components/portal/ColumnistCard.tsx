import { Link } from "@tanstack/react-router";

export interface Columnist {
  id: string;
  slug: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  role: string | null;
  headline: string | null;
}

export function ColumnistCard({ columnist }: { columnist: Columnist }) {
  const initials = columnist.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <Link
      to="/colunista/$slug"
      params={{ slug: columnist.slug }}
      className="group flex flex-col items-center rounded-xl border border-border bg-card p-5 text-center shadow-sm transition-colors hover:border-primary/40"
    >
      <div className="h-20 w-20 overflow-hidden rounded-full bg-muted">
        {columnist.avatar_url ? (
          <img
            src={columnist.avatar_url}
            alt={`Foto de ${columnist.name}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
            {initials}
          </div>
        )}
      </div>
      <h3 className="mt-3 font-semibold text-card-foreground transition-colors group-hover:text-primary">
        {columnist.name}
      </h3>
      {columnist.role && <p className="text-xs uppercase tracking-wide text-primary">{columnist.role}</p>}
      {(columnist.headline || columnist.bio) && (
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {columnist.headline || columnist.bio}
        </p>
      )}
    </Link>
  );
}
