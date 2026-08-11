import { Link } from "@tanstack/react-router";
import { Linkedin, Instagram, Youtube } from "lucide-react";

interface Category {
  slug: string;
  name: string;
}

interface FooterProps {
  categories: Category[];
}

export function Footer({ categories }: FooterProps) {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">S</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Síndico<span className="text-primary">Lab</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              O principal portal de conteúdo, notícias e negócios para o mercado condominial.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Navegação</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    to="/categoria/$slug"
                    params={{ slug: category.slug }}
                    className="transition-colors hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Institucional</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="transition-colors hover:text-foreground">
                  Sobre o SíndicoLab
                </Link>
              </li>
              <li>
                <Link to="/" className="transition-colors hover:text-foreground">
                  Anuncie
                </Link>
              </li>
              <li>
                <Link to="/" className="transition-colors hover:text-foreground">
                  Parceiros
                </Link>
              </li>
              <li>
                <Link to="/" className="transition-colors hover:text-foreground">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/" className="transition-colors hover:text-foreground">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Contato</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contato@sindicolab.com.br</li>
              <li>(11) 99999-9999</li>
              <li>Av. Paulista, 1000</li>
              <li>São Paulo - SP | 01310-100</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SíndicoLab. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
