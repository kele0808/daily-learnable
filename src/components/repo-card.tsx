import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { focusLabel } from "@/lib/curate";
import { relativeDayLabel } from "@/lib/dates";
import type { DigestPick } from "@/lib/types";

function formatStars(stars: number): string {
  if (stars >= 1000) return `${(stars / 1000).toFixed(stars >= 10000 ? 0 : 1)}k`;
  return String(stars);
}

export function RepoCard({ pick, index, date }: { pick: DigestPick; index: number; date: string }) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <Card className="bg-card/80">
      <CardHeader className="border-b">
        <div className="flex items-start gap-3">
          <span className="font-mono text-xs text-muted-foreground pt-1">{number}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pick.avatarUrl}
            alt=""
            width={36}
            height={36}
            className="mt-0.5 size-9 rounded-full ring-1 ring-foreground/10"
          />
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">
              <a
                href={pick.url}
                target="_blank"
                rel="noreferrer"
                className="break-all hover:underline"
              >
                {pick.fullName}
              </a>
            </CardTitle>
            <CardDescription className="mt-1">{pick.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-[15px] leading-7 text-foreground">{pick.reason}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant="default">{focusLabel(pick.focus)}</Badge>
          {pick.language ? <Badge variant="secondary">{pick.language}</Badge> : null}
          {pick.topics.slice(0, 4).map((topic) => (
            <Badge key={topic} variant="outline">
              {topic}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3 text-xs text-muted-foreground">
        <span>{relativeDayLabel(pick.createdAt, date)}</span>
        <span>star {formatStars(pick.stars)}</span>
      </CardFooter>
    </Card>
  );
}
