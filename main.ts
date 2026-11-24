// Entry for make.fun's "Promote make.fun's make-your-own-bounty post on X" bounty.
// Node 22, standard library only. It copies POST.json from the repository root
// to the output directory, byte for byte. The post itself is the entry: one post
// of the entrant's own on X that quotes make.fun's make-your-own-bounty post
// (https://x.com/makefunai/status/2124915864336236646) or links to it, with a
// photo of its own attached and make.fun or @makefunai and the play code in its
// text. POST.json names that post; the house reads the post's replies, reposts
// and quotes from X. Nothing this program writes about the post is scored.
//
// Outside the grader's container, MAKEFUN_INPUT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /input and /output:
//   mkdir -p out && MAKEFUN_INPUT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const INPUT_DIR = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// An X post address: https://x.com/<handle>/status/<digits> (or twitter.com,
// optionally with a www. or mobile. prefix). Anything else is not the entry's post.
const POST_URL_RE = /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/\s]+\/status\/\d+$/;

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

const sourcePath = join(INPUT_DIR, 'POST.json');
let sourceBytes: Buffer;
try {
  sourceBytes = readFileSync(sourcePath);
} catch (err) {
  fail(`POST.json could not be read from ${INPUT_DIR}: ${(err as Error).message}`);
}

let post: unknown;
try {
  post = JSON.parse(sourceBytes!.toString('utf8'));
} catch {
  fail('POST.json is not valid JSON.');
}
if (typeof post !== 'object' || post === null || Array.isArray(post)) {
  fail('POST.json must be a JSON object with a "url" string.');
}
const url = (post as { url?: unknown }).url;
if (typeof url !== 'string' || !POST_URL_RE.test(url)) {
  fail(`POST.json "url" must be an X post address (https://x.com/<handle>/status/<id>), got: ${JSON.stringify(url)}`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const destPath = join(OUTPUT_DIR, 'POST.json');
try {
  copyFileSync(sourcePath, destPath);
} catch (err) {
  console.error(`POST.json could not be copied from ${INPUT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

// The entry depends on the copy being byte-identical: prove it instead of
// assuming it. A truncated or corrupted copy must fail loudly, not ship.
let destBytes: Buffer;
try {
  destBytes = readFileSync(destPath);
} catch (err) {
  fail(`POST.json could not be read back from ${OUTPUT_DIR}: ${(err as Error).message}`);
}
if (!destBytes!.equals(sourceBytes!)) {
  fail(`POST.json in ${OUTPUT_DIR} differs from the source — copy is not byte-identical.`);
}
