import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

interface SectionPanelProps {
  title: string;
  moreLabel?: string;
  moreTo?: string;
  moreParams?: Record<string, string>;
  children: ReactNode;
  className?: string;
}

export function SectionPanel({
  title,
  moreLabel = "Ver mais",
  moreTo,
  moreParams,
  children,
  className = "",
}: SectionPanelProps) {
  return (
    <section className={`surface-card flex flex-col overflow-hidden rounded-xl ${className}`}>
      <header className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">{title}</h2>
        {moreTo && (
          <Link
            // @ts-expect-error dynamic route string
            to={moreTo}
            params={moreParams}
            className="flex items-center gap-0.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            {moreLabel} <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </header>
      <div className="flex-1 p-4">{children}</div>
    </section>
  );
}
