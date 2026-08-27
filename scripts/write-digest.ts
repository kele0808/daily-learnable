import { readArchivedDigest, writeCatalogReadmes, writeDigestArchive } from "../src/lib/archive";
import { isValidDateKey, todayInShanghai } from "../src/lib/dates";
import { searchAndCurate } from "../src/lib/digest";

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const catalogOnly = args.includes("--catalog");
  const dateArg = args.find((arg) => !arg.startsWith("--"));

  if (catalogOnly) {
    await writeCatalogReadmes();
    console.log("updated README.md and digests/README.md");
    return;
  }

  const date = dateArg && isValidDateKey(dateArg) ? dateArg : todayInShanghai();

  if (!force) {
    const existing = await readArchivedDigest(date);
    if (existing) {
      console.log(`already exists: digests/${date}.md (${existing.count} picks)`);
      process.exit(0);
    }
  }

  const digest = await searchAndCurate(date);
  if (digest.picks.length === 0) {
    console.error("no learnable repos found; not writing empty archive");
    process.exit(1);
  }

  const paths = await writeDigestArchive(digest);
  console.log(`wrote ${paths.markdownPath}`);
  console.log(`wrote ${paths.jsonPath}`);
  console.log(`picks ${digest.count} · searched ${digest.searched}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
