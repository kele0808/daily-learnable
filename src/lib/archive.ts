import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { digestIndexMarkdown, digestToMarkdown } from "@/lib/format-digest";
import type { DigestResult } from "@/lib/types";

export const DIGESTS_DIR = path.join(process.cwd(), "digests");

export async function readArchivedDigest(date: string): Promise<DigestResult | null> {
  try {
    const raw = await readFile(path.join(DIGESTS_DIR, `${date}.json`), "utf8");
    const parsed = JSON.parse(raw) as DigestResult;
    if (!parsed || parsed.date !== date || !Array.isArray(parsed.picks)) return null;
    return { ...parsed, source: "archive", warnings: [] };
  } catch {
    return null;
  }
}

export async function listArchivedDays(): Promise<{ date: string; count: number }[]> {
  let names: string[] = [];
  try {
    names = await readdir(DIGESTS_DIR);
  } catch {
    return [];
  }

  const days: { date: string; count: number }[] = [];
  for (const name of names) {
    if (!name.endsWith(".json")) continue;
    const date = name.slice(0, -5);
    const digest = await readArchivedDigest(date);
    if (digest) days.push({ date, count: digest.count });
  }
  return days.sort((a, b) => b.date.localeCompare(a.date));
}

export async function writeDigestArchive(digest: DigestResult): Promise<{
  jsonPath: string;
  markdownPath: string;
}> {
  await mkdir(DIGESTS_DIR, { recursive: true });
  const jsonPath = path.join(DIGESTS_DIR, `${digest.date}.json`);
  const markdownPath = path.join(DIGESTS_DIR, `${digest.date}.md`);
  const archived: DigestResult = { ...digest, source: "archive", warnings: [] };

  await writeFile(jsonPath, `${JSON.stringify(archived, null, 2)}\n`, "utf8");
  await writeFile(markdownPath, digestToMarkdown(archived), "utf8");

  const days = await listArchivedDays();
  await writeFile(path.join(DIGESTS_DIR, "README.md"), digestIndexMarkdown(days), "utf8");

  return { jsonPath, markdownPath };
}
