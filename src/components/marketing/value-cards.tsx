import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValueCard {
  icon: LucideIcon;
  title: string;
  body: string;
}

interface ValueCardsProps {
  cards: ValueCard[];
  columns?: 2 | 3 | 4;
}

export function ValueCards({ cards, columns = 3 }: ValueCardsProps) {
  const colClass =
    columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : columns === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-2 md:grid-cols-3";

  return (
    <ul
      className={cn("grid gap-6", colClass)}
      aria-label="Value highlights"
    >
      {cards.map((card) => (
        <li
          key={card.title}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <card.icon
            className="h-7 w-7 text-accent"
            aria-hidden="true"
          />
          <h3 className="mt-3 text-base font-semibold">{card.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{card.body}</p>
        </li>
      ))}
    </ul>
  );
}
