import { focusLabel } from "@/lib/curate";
import { formatChineseDate } from "@/lib/dates";
import type { DigestResult } from "@/lib/types";

export function digestToMarkdown(digest: DigestResult): string {
  const lines = [
    `# 今日可学 · ${formatChineseDate(digest.date)}`,
    "",
    `选出 **${digest.count}** 个。不按 star 排行，只看当下能不能学到东西。`,
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
    lines.push(`${tags.join(" · ")} · star ${pick.stars}（仅参考）`);
    lines.push("");
  });

  if (digest.picks.length === 0) {
    lines.push("这一天没有筛出可写进仓库的项目。");
    lines.push("");
  }

  return lines.join("\n");
}

export function digestIndexMarkdown(
  days: { date: string; count: number }[],
): string {
  const rows = days
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((day) => `| [${day.date}](./${day.date}.md) | ${day.count} |`)
    .join("\n");

  return [
    "# 日报存档",
    "",
    "Cursor Automation 或 `npm run digest` 每天把精选写进这里。打开某一天的 `.md` 就能看。",
    "",
    "| 日期 | 条数 |",
    "| --- | ---: |",
    rows || "| （还没有日报） | 0 |",
    "",
  ].join("\n");
}
