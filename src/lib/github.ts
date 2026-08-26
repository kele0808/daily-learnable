import type { GithubRepo } from "@/lib/types";

export class GithubSearchError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "GithubSearchError";
  }
}

type SearchResponse = {
  total_count: number;
  incomplete_results: boolean;
  items: GithubRepo[];
  message?: string;
};

function isoDaysBefore(dateKey: string, days: number): string {
  const utc = new Date(`${dateKey}T00:00:00Z`);
  utc.setUTCDate(utc.getUTCDate() - days);
  return utc.toISOString().slice(0, 10);
}

export function buildSearchQueries(dateKey: string): { label: string; query: string }[] {
  const pushed = isoDaysBefore(dateKey, 14);
  const created = isoDaysBefore(dateKey, 40);

  return [
    {
      label: "ai-agent",
      query: `topic:ai-agent fork:false archived:false pushed:>${pushed} stars:3..50000`,
    },
    {
      label: "mcp",
      query: `(topic:mcp OR "model context protocol" OR mcp-server) fork:false archived:false created:>${created} stars:2..50000`,
    },
    {
      label: "coding-agent",
      query: `("coding agent" OR "ai agent" OR "computer use" OR "claude code" OR "agent skill") fork:false archived:false created:>${created} stars:2..50000`,
    },
    {
      label: "fresh",
      query: `(topic:ai-agent OR topic:mcp OR topic:agents) fork:false archived:false created:>${isoDaysBefore(dateKey, 10)}`,
    },
  ];
}

export async function searchGithubRepos(
  dateKey: string,
): Promise<{ repos: GithubRepo[]; warnings: string[] }> {
  const queries = buildSearchQueries(dateKey);
  const warnings: string[] = [];
  const byId = new Map<number, GithubRepo>();

  const results = await Promise.allSettled(
    queries.map((item) => searchOnce(item.query)),
  );

  results.forEach((result, index) => {
    const label = queries[index].label;
    if (result.status === "fulfilled") {
      for (const repo of result.value) {
        if (!byId.has(repo.id)) byId.set(repo.id, repo);
      }
      return;
    }

    const err = result.reason;
    if (err instanceof GithubSearchError && (err.status === 403 || err.status === 429)) {
      warnings.push(
        `GitHub 搜索额度用尽（${label}）。可在本机设置 GITHUB_TOKEN 后重试。`,
      );
      return;
    }
    warnings.push(`搜索 ${label} 失败：${err instanceof Error ? err.message : "未知错误"}`);
  });

  return { repos: [...byId.values()], warnings };
}

async function searchOnce(query: string): Promise<GithubRepo[]> {
  const url = new URL("https://api.github.com/search/repositories");
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "updated");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", "30");

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "daily-learnable",
  };

  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  const next = process.env.NEXT_RUNTIME
    ? { next: { revalidate: 21600 } }
    : { cache: "no-store" as const };

  const response = await fetch(url, {
    headers,
    ...next,
  });

  if (!response.ok) {
    throw new GithubSearchError(
      `GitHub API ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  const payload = (await response.json()) as SearchResponse;
  if (!Array.isArray(payload.items)) {
    throw new GithubSearchError(payload.message ?? "GitHub 返回了无法解析的结果");
  }

  return payload.items;
}
