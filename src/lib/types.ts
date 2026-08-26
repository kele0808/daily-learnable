export type Focus =
  | "agent"
  | "coding-agent"
  | "mcp"
  | "multi-agent"
  | "rag"
  | "eval"
  | "skill"
  | "ai-tool";

export type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  topics?: string[];
  created_at: string;
  pushed_at: string;
  updated_at: string;
  fork: boolean;
  archived: boolean;
  size: number;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  license: { spdx_id: string; name: string } | null;
};

export type ScoredRepo = {
  repo: GithubRepo;
  score: number;
  focus: Focus;
  signals: string[];
};

export type DigestPick = {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string;
  language: string | null;
  topics: string[];
  stars: number;
  createdAt: string;
  pushedAt: string;
  owner: string;
  ownerUrl: string;
  avatarUrl: string;
  focus: Focus;
  reason: string;
  signals: string[];
};

export type DigestResult = {
  date: string;
  timezone: string;
  count: number;
  picks: DigestPick[];
  searched: number;
  considered: number;
  source: "github" | "partial" | "archive";
  warnings: string[];
};
