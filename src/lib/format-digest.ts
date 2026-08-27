import { focusLabel } from "@/lib/curate";
import { formatChineseDate } from "@/lib/dates";
import type { DigestPick, DigestResult } from "@/lib/types";

export type DigestDaySummary = {
  date: string;
  count: number;
  picks: Pick<DigestPick, "fullName" | "url">[];
};

const MONTH_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function monthLabel(date: string, locale: "zh" | "en" = "zh"): string {
  const [year, month] = date.split("-");
  const monthIndex = Number(month) - 1;
  if (locale === "en") return `${MONTH_EN[monthIndex]} ${year}`;
  return `${year}年${Number(month)}月`;
}

export function languageSwitcher(current: "en" | "zh"): string {
  if (current === "en") {
    return "**English** | [中文](README.zh-CN.md)";
  }
  return "[English](README.md) | **中文**";
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
  locale: "zh" | "en" = "zh",
): string {
  const header =
    locale === "en"
      ? "| Month | Date | Projects |\n| --- | --- | --- |"
      : "| 月份 | 日期 | 项目 |\n| --- | --- | --- |";
  const empty = locale === "en" ? "| — | — | No digests yet |" : "| — | — | 还没有日报 |";

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
      return `| ${monthLabel(day.date, locale)} | [${day.date}](${linkPrefix}${day.date}.md) | ${projects} |`;
    })
    .join("\n");

  return [header, rows || empty].join("\n");
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
    catalogTable(days, options.linkPrefix, "zh"),
    "",
  ].join("\n");
}

export function rootReadmeMarkdown(days: DigestDaySummary[], locale: "en" | "zh"): string {
  if (locale === "en") {
    return [
      "# Daily Learnable",
      "",
      languageSwitcher("en"),
      "",
      "Every **Monday**, a Cursor Agent searches GitHub for **Agent / MCP / coding-agent** repos, reviews each candidate, and keeps **3–5** worth studying. Results land in [`digests/`](digests/).",
      "",
      "High star count is preferred. The agent still opens the README and recent commits and drops empty or spammy projects.",
      "",
      "## Digest",
      "",
      "Click a date for that week's write-up.",
      "",
      catalogTable(days, "digests/", "en"),
      "",
      "## Local preview",
      "",
      "```bash",
      "npm install",
      "npm run dev",
      "```",
      "",
      "Open http://127.0.0.1:3847. Generate a date with `npm run digest`.",
      "",
    ].join("\n");
  }

  return [
    "# 今日可学",
    "",
    languageSwitcher("zh"),
    "",
    "每周一由 Cursor Agent 从 GitHub 搜索 **Agent / MCP / 编程 Agent** 相关仓库，先 review 再选出 3–5 个，写进 [`digests/`](digests/)。",
    "",
    "优先高 star，并打开仓库看 README 和近期提交，丢掉空壳和灌水。",
    "",
    "## 日报",
    "",
    "点日期看当周完整说明。",
    "",
    catalogTable(days, "digests/", "zh"),
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
