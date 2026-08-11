import { Link } from "@tanstack/react-router";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import logoAsset from "@/assets/sindicolab-logo.png.asset.json";

interface Category {
  slug: string;
  name: string;
}

interface HeaderProps {
  categories: Category[];
}

export function Header({ categories }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2">
            <img
              src={logoAsset.url}
              alt="SíndicoLab"
              className="h-9 w-9 shrink-0 rounded-lg object-cover"
            />
            <span className="truncate text-xl font-bold tracking-tight text-foreground">
              Síndico<span className="text-primary">Lab</span>
            </span>
          </Link>

          <div className="hidden flex-1 max-w-md md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar no SíndicoLab..."
                className="h-10 w-full rounded-full border border-input bg-white/40 backdrop-blur pl-10 pr-4 text-sm text-foreground outline-none ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="hidden items-center gap-4 text-sm font-medium text-foreground md:flex">
            <Link to="/auth" className="text-muted-foreground transition-colors hover:text-foreground">
              Entrar
            </Link>
          </div>

          <button
            type="button"
            className="rounded-md p-2 text-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <nav className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul className="hidden items-center gap-1 overflow-x-auto py-2 text-sm font-medium text-foreground md:flex">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  to="/categoria/$slug"
                  params={{ slug: category.slug }}
                  className="block rounded-md px-3 py-2 text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                  activeProps={{ className: "bg-accent text-accent-foreground" }}
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/colunistas"
                className="block rounded-md px-3 py-2 text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                activeProps={{ className: "bg-accent text-accent-foreground" }}
              >
                Colunistas
              </Link>
            </li>
          </ul>
        </div>

        {mobileOpen && (
          <div className="border-t border-border md:hidden">
            <div className="mx-auto max-w-7xl space-y-2 px-4 py-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Buscar no SíndicoLab..."
                  className="h-10 w-full rounded-full border border-input bg-white/40 backdrop-blur pl-10 pr-4 text-sm text-foreground outline-none ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to="/categoria/$slug"
                  params={{ slug: category.slug }}
                  className="block rounded-md px-3 py-2 text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link
                to="/colunistas"
                className="block rounded-md px-3 py-2 text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Colunistas
              </Link>
              <Link
                to="/auth"
                className="block rounded-md px-3 py-2 text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Entrar
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
