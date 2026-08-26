import { DayNav } from "@/components/day-nav";
import { RepoCard } from "@/components/repo-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatChineseDate } from "@/lib/dates";
import { getDailyDigest } from "@/lib/digest";
import { CircleAlert } from "lucide-react";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const digest = await getDailyDigest(dateParam);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="text-sm font-medium text-primary">今日可学</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          每天 1–10 个当下值得看的 AI / Agent 仓库
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground leading-7">
          不按 star 排行。每天从 GitHub 搜最近出现、正在更新的 Agent、MCP、编程 Agent、RAG
          等项目，只留下描述清楚、能学到东西的那几个。
        </p>
      </header>

      <section className="mb-6 space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-medium">{formatChineseDate(digest.date)}</h2>
          <p className="text-sm text-muted-foreground">
            选出 {digest.count} 个 · 扫描 {digest.searched} 个 · 入围 {digest.considered} 个
          </p>
        </div>
        <DayNav date={digest.date} />
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
          筛选规则：只要最近大约 40 天内新建、或两周内还在推送的公开仓库；必须带能读懂的描述；主题要落在
          Agent / MCP / RAG / 评测这条线上。star 只展示，不参与打分。同一天的名单会缓存约 6 小时。
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
