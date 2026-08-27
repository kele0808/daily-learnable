import { daysBetween } from "@/lib/dates";
import type { DigestPick, Focus, GithubRepo, ScoredRepo } from "@/lib/types";

const FOCUS_LABELS: Record<Focus, string> = {
  agent: "Agent 框架",
  "coding-agent": "编程 Agent",
  mcp: "MCP",
  "multi-agent": "多智能体",
  rag: "RAG",
  eval: "评测 / 观测",
  skill: "Agent Skill",
  "ai-tool": "AI 工具",
};

const NOISE_NAME = /(untitled|test[-_]?repo|asdf|foobar|hello[-_]?world|homework|assignment)/i;
const NOISE_OWNER = /^(user\d{5,}|[a-z]+\d{6,}|[a-z0-9]{18,})$/i;
const NOISE_COPY =
  /airdrop|\bnft\b|token sale|click\s*&\s*build|\bfree\b.*open models|crypto[- ]?agent|earn money|passive income/i;

export function focusLabel(focus: Focus): string {
  return FOCUS_LABELS[focus];
}

export function scoreRepos(repos: GithubRepo[], dateKey: string): ScoredRepo[] {
  return repos
    .filter((repo) => isLearnableCandidate(repo, dateKey))
    .map((repo) => {
      const { focus, signals } = detectFocus(repo);
      return {
        repo,
        focus,
        signals,
        score: computeScore(repo, dateKey, focus, signals),
      };
    })
    .filter((item) => item.score > 8)
    .sort((a, b) => b.score - a.score);
}

export function pickDailyRepos(scored: ScoredRepo[], dateKey: string): DigestPick[] {
  const pool = scored.slice(0, 40);

  const picked: ScoredRepo[] = [];
  const owners = new Map<string, number>();
  const focuses = new Map<Focus, number>();

  for (const item of pool) {
    if (picked.length >= targetCount(scored.length)) break;
    const ownerCount = owners.get(item.repo.owner.login) ?? 0;
    const focusCount = focuses.get(item.focus) ?? 0;
    if (ownerCount >= 1) continue;
    if (focusCount >= 3) continue;
    if (tooSimilar(item, picked)) continue;
    picked.push(item);
    owners.set(item.repo.owner.login, ownerCount + 1);
    focuses.set(item.focus, focusCount + 1);
  }

  if (picked.length < 4) {
    for (const item of pool) {
      if (picked.length >= 6) break;
      if (picked.some((p) => p.repo.id === item.repo.id)) continue;
      picked.push(item);
    }
  }

  return picked.slice(0, 10).map((item) => toPick(item, dateKey));
}

export function isLearnableCandidate(repo: GithubRepo, dateKey: string): boolean {
  if (repo.fork || repo.archived) return false;
  if (repo.size <= 0) return false;

  const description = (repo.description ?? "").trim();
  if (description.length < 32) return false;
  if (description.toLowerCase() === repo.name.toLowerCase()) return false;
  if (NOISE_NAME.test(repo.name) || NOISE_NAME.test(description)) return false;
  if (NOISE_COPY.test(description) || NOISE_COPY.test(repo.name)) return false;
  if (NOISE_OWNER.test(repo.owner.login)) return false;
  if (repo.size < 20) return false;

  const createdDays = daysBetween(dateKey, repo.created_at);
  const pushedDays = daysBetween(dateKey, repo.pushed_at.slice(0, 10));
  if (createdDays > 50 && pushedDays > 18) return false;
  if (repo.stargazers_count < 10 && createdDays > 7) return false;

  const haystack = haystackOf(repo);
  return AGENT_NOW.some((word) => haystack.includes(word));
}

export function detectFocus(repo: GithubRepo): { focus: Focus; signals: string[] } {
  const haystack = haystackOf(repo);
  const signals: string[] = [];

  const add = (flag: boolean, signal: string) => {
    if (flag) signals.push(signal);
  };

  add(/mcp|model context protocol/.test(haystack), "mcp");
  add(/coding agent|swe-agent|claude code|computer use|browser use|code agent/.test(haystack), "coding-agent");
  add(/multi-agent|multi agent|swarm|crewai|autogen|magentic/.test(haystack), "multi-agent");
  add(/\brag\b|retrieval|vector database|embedding/.test(haystack), "rag");
  add(/eval|benchmark|observab|tracing|langfuse/.test(haystack), "eval");
  add(/agent skill|claude skill|\/skills\b/.test(haystack), "skill");
  add(/agent/.test(haystack), "agent");
  add(/from scratch|tutorial|implementation|example|learn/.test(haystack), "learn-by-reading");

  let focus: Focus = "ai-tool";
  if (signals.includes("mcp")) focus = "mcp";
  else if (signals.includes("coding-agent")) focus = "coding-agent";
  else if (signals.includes("multi-agent")) focus = "multi-agent";
  else if (signals.includes("skill")) focus = "skill";
  else if (signals.includes("rag")) focus = "rag";
  else if (signals.includes("eval")) focus = "eval";
  else if (signals.includes("agent")) focus = "agent";

  return { focus, signals };
}

function computeScore(
  repo: GithubRepo,
  dateKey: string,
  focus: Focus,
  signals: string[],
): number {
  const createdDays = daysBetween(dateKey, repo.created_at);
  const pushedDays = daysBetween(dateKey, repo.pushed_at.slice(0, 10));
  let score = 0;

  if (createdDays <= 3) score += 36;
  else if (createdDays <= 7) score += 28;
  else if (createdDays <= 14) score += 20;
  else if (createdDays <= 30) score += 12;
  else score += 4;

  if (pushedDays <= 1) score += 18;
  else if (pushedDays <= 4) score += 12;
  else if (pushedDays <= 10) score += 7;

  const focusBoost: Record<Focus, number> = {
    "coding-agent": 22,
    mcp: 20,
    agent: 18,
    "multi-agent": 16,
    skill: 16,
    rag: 10,
    eval: 10,
    "ai-tool": 4,
  };
  score += focusBoost[focus];
  if (signals.includes("learn-by-reading")) score += 14;

  const description = repo.description ?? "";
  if (description.length >= 60 && description.length <= 240) score += 8;
  if ((repo.topics?.length ?? 0) >= 2) score += 5;
  if (["TypeScript", "Python", "Go", "Rust", "JavaScript"].includes(repo.language ?? "")) {
    score += 4;
  }

  // Prefer higher-star repos; log scale so 200 vs 2k still matters without only keeping giants.
  score += Math.log10(repo.stargazers_count + 1) * 28;
  return score;
}

function toPick(item: ScoredRepo, dateKey: string): DigestPick {
  return {
    id: item.repo.id,
    name: item.repo.name,
    fullName: item.repo.full_name,
    url: item.repo.html_url,
    description: (item.repo.description ?? "").trim(),
    language: item.repo.language,
    topics: (item.repo.topics ?? []).slice(0, 6),
    stars: item.repo.stargazers_count,
    createdAt: item.repo.created_at,
    pushedAt: item.repo.pushed_at,
    owner: item.repo.owner.login,
    ownerUrl: item.repo.owner.html_url,
    avatarUrl: item.repo.owner.avatar_url,
    focus: item.focus,
    reason: learningReason(item, dateKey),
    signals: item.signals,
  };
}

function learningReason(item: ScoredRepo, dateKey: string): string {
  const lang = item.repo.language ? `用 ${item.repo.language} 写的` : "一个";
  const age = daysBetween(dateKey, item.repo.created_at);
  const freshness =
    age <= 7 ? "这几天刚出现" : age <= 21 ? "最近几周很活跃" : "近期仍在更新";

  const byFocus: Record<Focus, string> = {
    agent: `${freshness}的 ${lang} Agent 框架。适合看任务循环、工具调用和记忆是怎么串起来的。`,
    "coding-agent": `${freshness}的编程 Agent。值得对照看它怎么读仓库、改文件、跑命令。`,
    mcp: `${freshness}的 MCP 实现。MCP 是当下给模型接工具和数据的主流协议，适合对照规范看落地。`,
    "multi-agent": `${freshness}的多智能体项目。适合学任务怎么拆、角色怎么分、结果怎么汇总。`,
    rag: `${freshness}的 RAG 相关实现。适合看检索、分块和生成是怎么接到一起的。`,
    eval: `${freshness}的评测或观测项目。Agent 好不好用，最终还是要能量化。`,
    skill: `${freshness}的 Agent Skill / 技能包。适合看「可复用指令」是怎么写成仓库的。`,
    "ai-tool": `${freshness}的 AI 工具。star 更高说明更多人在用，适合对照看它解决的具体问题。`,
  };

  return byFocus[item.focus];
}

function targetCount(poolSize: number): number {
  if (poolSize >= 28) return 8;
  if (poolSize >= 14) return 7;
  if (poolSize >= 8) return 6;
  return Math.max(1, Math.min(5, poolSize));
}

function tooSimilar(item: ScoredRepo, picked: ScoredRepo[]): boolean {
  const name = item.repo.name.toLowerCase();
  return picked.some((other) => {
    const otherName = other.repo.name.toLowerCase();
    return name.includes(otherName) || otherName.includes(name);
  });
}

function haystackOf(repo: GithubRepo): string {
  return [repo.name, repo.full_name, repo.description ?? "", ...(repo.topics ?? [])]
    .join(" ")
    .toLowerCase();
}

const AGENT_NOW = [
  "agent",
  "mcp",
  "model context protocol",
  "llm",
  "rag",
  "claude",
  "cursor",
  "computer use",
  "browser use",
  "skill",
  "agentic",
  "openai",
  "copilot",
];

