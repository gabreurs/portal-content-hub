import { Link } from "@tanstack/react-router";
import { Search, Menu, X, Linkedin, Instagram, Youtube, CalendarDays, Cloud, ChevronDown } from "lucide-react";
import { useState } from "react";
import logoAsset from "@/assets/sindicolab-logo.png.asset.json";

interface Category {
  slug: string;
  name: string;
}

interface HeaderProps {
  categories: Category[];
}

const today = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function Header({ categories }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dateLabel = today.format(new Date());

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl">
      {/* Top bar */}
      <div className="border-b border-border/60 bg-card/70">
        <div className="mx-auto flex h-9 max-w-7xl items-center gap-3 px-4 text-xs sm:px-6 lg:px-8">
          <span className="brand-gradient rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            Ao vivo
          </span>
          <p className="truncate text-muted-foreground">
            Cobertura: Encontro Nacional de Síndicos 2026
            <span className="mx-2 hidden text-primary sm:inline">•</span>
            <span className="hidden sm:inline">Painel: Inadimplência cai em 2026, diz índice</span>
          </p>
          <div className="ml-auto hidden items-center gap-5 text-muted-foreground lg:flex">
            <a href="#anuncie" className="transition-colors hover:text-foreground">Anuncie</a>
            <a href="#newsletter" className="transition-colors hover:text-foreground">Newsletter</a>
            <a href="#contato" className="transition-colors hover:text-foreground">Contato</a>
            <span className="flex items-center gap-3">
              <a href="#" aria-label="LinkedIn" className="transition-colors hover:text-primary"><Linkedin className="h-4 w-4" /></a>
              <a href="#" aria-label="Instagram" className="transition-colors hover:text-primary"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label="YouTube" className="transition-colors hover:text-primary"><Youtube className="h-4 w-4" /></a>
            </span>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-6">
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-3">
            <img src={logoAsset.url} alt="SíndicoLab" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
            <span className="truncate text-2xl font-extrabold tracking-tight text-foreground">
              Síndico<span className="text-primary">Lab</span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 text-sm text-muted-foreground xl:flex">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span className="leading-tight">
                <span className="block text-foreground first-letter:uppercase">{dateLabel}</span>
                <span className="block text-xs">São Paulo, SP</span>
              </span>
            </span>
            <span className="h-8 w-px bg-border" />
            <span className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              <span className="leading-tight">
                <span className="block text-foreground">23°C</span>
                <span className="block text-xs">Nublado</span>
              </span>
            </span>
          </div>

          <div className="hidden w-full max-w-xs md:block">
            <div className="relative">
              <input
                type="search"
                placeholder="Buscar no SíndicoLab..."
                className="h-10 w-full rounded-lg border border-input bg-background px-4 pr-10 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
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

      {/* Nav bar */}
      <nav className="border-y border-border/60 bg-card/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul className="hidden items-center gap-1 py-1.5 text-[13px] font-semibold uppercase tracking-wide md:flex">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  to="/categoria/$slug"
                  params={{ slug: category.slug }}
                  className="block rounded-md px-3 py-2 text-foreground/75 transition-colors hover:bg-accent hover:text-primary"
                  activeProps={{ className: "bg-accent text-primary" }}
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/colunistas"
                className="block rounded-md px-3 py-2 text-foreground/75 transition-colors hover:bg-accent hover:text-primary"
                activeProps={{ className: "bg-accent text-primary" }}
              >
                Colunistas
              </Link>
            </li>
            <li className="ml-auto">
              <Link
                to="/auth"
                className="flex items-center gap-1 rounded-md px-3 py-2 text-foreground/75 transition-colors hover:text-primary"
              >
                Entrar <ChevronDown className="h-3.5 w-3.5" />
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
                  className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
