import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { shiftDate, todayInShanghai } from "@/lib/dates";

export function DayNav({
  date,
  archivedDates = [],
}: {
  date: string;
  archivedDates?: string[];
}) {
  const today = todayInShanghai();
  const prev = shiftDate(date, -1);
  const next = shiftDate(date, 1);
  const canGoNext = next <= today;
  const earliest = shiftDate(today, -60);
  const archived = new Set(archivedDates);
  const canGoPrev = prev >= earliest || archived.has(prev);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        {canGoPrev ? (
          <Link
            href={`/?date=${prev}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            前一天
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50",
            )}
          >
            前一天
          </span>
        )}
        {date !== today ? (
          <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            回到今天
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">按上海时区计算「今天」</span>
        )}
        {canGoNext ? (
          <Link
            href={`/?date=${next}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            后一天
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50",
            )}
          >
            后一天
          </span>
        )}
      </div>
      {archivedDates.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {archivedDates.slice(0, 14).map((archivedDate) => (
            <Link
              key={archivedDate}
              href={`/?date=${archivedDate}`}
              className={cn(
                buttonVariants({
                  variant: archivedDate === date ? "default" : "outline",
                  size: "xs",
                }),
              )}
            >
              {archivedDate.slice(5)}
              {archivedDate === today ? " 今" : ""}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
