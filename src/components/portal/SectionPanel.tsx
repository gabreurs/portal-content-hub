import type { ReactNode } from "react";

interface SectionPanelProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionPanel({ title, action, children, className = "" }: SectionPanelProps) {
  return (
    <section className={`surface-card flex flex-col overflow-hidden rounded-xl ${className}`}>
      <header className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">{title}</h2>
        {action}
      </header>
      <div className="flex-1 p-4">{children}</div>
    </section>
  );
}
