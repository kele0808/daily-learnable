import { readArchivedDigest } from "@/lib/archive";
import { pickDailyRepos, scoreRepos } from "@/lib/curate";
import { clampDigestDate, DIGEST_TIMEZONE, todayInShanghai } from "@/lib/dates";
import { searchGithubRepos } from "@/lib/github";
import type { DigestResult } from "@/lib/types";

export async function searchAndCurate(date: string): Promise<DigestResult> {
  const { repos, warnings } = await searchGithubRepos(date);
  const scored = scoreRepos(repos, date);
  const picks = pickDailyRepos(scored, date);

  return {
    date,
    timezone: DIGEST_TIMEZONE,
    count: picks.length,
    picks,
    searched: repos.length,
    considered: scored.length,
    source: warnings.length > 0 && picks.length > 0 ? "partial" : "github",
    warnings,
  };
}

export async function getDailyDigest(rawDate?: string): Promise<DigestResult> {
  const today = todayInShanghai();
  const requested = clampDigestDate(rawDate, today);
  const archived = await readArchivedDigest(requested);
  if (archived) return archived;
  return searchAndCurate(requested);
}
