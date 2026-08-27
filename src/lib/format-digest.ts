import { focusLabel } from "@/lib/curate";
import { formatChineseDate } from "@/lib/dates";
import type { DigestPick, DigestResult } from "@/lib/types";

export type DigestDaySummary = {
  date: string;
  count: number;
  picks: Pick<DigestPick, "fullName" | "url">[];
};

export function monthLabel(date: string): string {
  const [year, month] = date.split("-");
  return `${year}年${Number(month)}月`;
}

export function digestToMarkdown(digest: DigestResult): string {
  const lines = [
    `# 今日可学 · ${formatChineseDate(digest.date)}`,
    "",
    `选出 **${digest.count}** 个。优先高 star，同时要和 Agent 相关、近期仍在更新。`,
    "",
  ];

  digest.picks.forEach((pick, index) => {
    const tags = [
      focusLabel(pick.focus),
      pick.language,
      ...pick.topics.slice(0, 3),
    ].filter(Boolean);

    lines.push(`## ${index + 1}. [${pick.fullName}](${pick.url})`);
    lines.push("");
    lines.push(pick.description);
    lines.push("");
    lines.push(`**为什么看：** ${pick.reason}`);
    lines.push("");
    lines.push(`${tags.join(" · ")} · star ${pick.stars}`);
    lines.push("");
  });

  if (digest.picks.length === 0) {
    lines.push("这一天没有筛出可写进仓库的项目。");
    lines.push("");
  }

  return lines.join("\n");
}

export function catalogTable(
  days: DigestDaySummary[],
  linkPrefix: string,
): string {
  const rows = days
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((day) => {
      const projects =
        day.picks.length > 0
          ? day.picks
              .map((pick) => `[${pick.fullName}](${pick.url})`)
              .join(" · ")
          : "—";
      return `| ${monthLabel(day.date)} | [${day.date}](${linkPrefix}${day.date}.md) | ${projects} |`;
    })
    .join("\n");

  return [
    "| 月份 | 日期 | 项目 |",
    "| --- | --- | --- |",
    rows || "| — | — | 还没有日报 |",
  ].join("\n");
}

export function digestIndexMarkdown(
  days: DigestDaySummary[],
  options: { linkPrefix: string; title: string; intro: string },
): string {
  return [
    `# ${options.title}`,
    "",
    options.intro,
    "",
    catalogTable(days, options.linkPrefix),
    "",
  ].join("\n");
}

export function rootReadmeMarkdown(days: DigestDaySummary[]): string {
  return [
    "# 今日可学",
    "",
    "每周一从 GitHub 拉取当下值得看的 **Agent / MCP / 编程 Agent** 相关仓库，选出 3–5 个，写进 [`digests/`](digests/)。",
    "",
    "优先高 star，同时要主题对、近期还在更新。",
    "",
    "## 日报",
    "",
    "点日期看当周完整说明。",
    "",
    catalogTable(days, "digests/"),
    "",
    "## 本地预览",
    "",
    "```bash",
    "npm install",
    "npm run dev",
    "```",
    "",
    "打开 http://127.0.0.1:3847 。补生成某一天：`npm run digest`。",
    "",
  ].join("\n");
}
