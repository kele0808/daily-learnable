import { DayNav } from "@/components/day-nav";
import { RepoCard } from "@/components/repo-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { listArchivedDays } from "@/lib/archive";
import { formatChineseDate } from "@/lib/dates";
import { getDailyDigest } from "@/lib/digest";
import { CircleAlert } from "lucide-react";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const [digest, archivedDays] = await Promise.all([
    getDailyDigest(dateParam),
    listArchivedDays(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="text-sm font-medium text-primary">今日可学</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          每周一 3–5 个当下值得看的 AI / Agent 仓库
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground leading-7">
          每周一由 Cursor Agent 搜索 Agent / MCP 相关仓库，先 review 再选出 3–5 个写进{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">digests/</code>
          。GitHub 上按日期翻，网页也会优先读这些存档。
        </p>
      </header>

      <section className="mb-6 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-medium">{formatChineseDate(digest.date)}</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={digest.source === "archive" ? "default" : "secondary"}>
              {digest.source === "archive" ? "已写入仓库" : "实时搜索"}
            </Badge>
            <span>
              选出 {digest.count} 个 · 扫描 {digest.searched} 个 · 入围 {digest.considered} 个
            </span>
          </div>
        </div>
        <DayNav date={digest.date} archivedDates={archivedDays.map((day) => day.date)} />
      </section>

      {digest.warnings.length > 0 ? (
        <Alert className="mb-6">
          <CircleAlert />
          <AlertTitle>部分搜索没完成</AlertTitle>
          <AlertDescription>
            {digest.warnings[0]} 下面是目前还能用的结果。
          </AlertDescription>
        </Alert>
      ) : null}

      {digest.picks.length === 0 ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>今天没有筛出可学的仓库</AlertTitle>
          <AlertDescription>
            GitHub
            搜索可能被限流，或这一天的候选都太空、太旧。配上 GitHub
            Token 后再刷新，或换相邻日期看看。
          </AlertDescription>
        </Alert>
      ) : (
        <ol className="flex flex-col gap-4">
          {digest.picks.map((pick, index) => (
            <li key={pick.id}>
              <RepoCard pick={pick} index={index} date={digest.date} />
            </li>
          ))}
        </ol>
      )}

      <footer className="mt-12 border-t pt-6 text-sm leading-7 text-muted-foreground">
        <p>
          存档文件：
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            digests/{digest.date}.md
          </code>
          。每周一 3–5 个；Cursor Agent 会先看 README 和近期提交。主题落在 Agent / MCP / RAG /
          评测，优先高 star，已出现过的仓库会尽量跳过。
        </p>
        <p className="mt-2">
          JSON：{" "}
          <a className="underline underline-offset-4" href={`/api/digest?date=${digest.date}`}>
            /api/digest?date={digest.date}
          </a>
        </p>
      </footer>
    </div>
  );
}
