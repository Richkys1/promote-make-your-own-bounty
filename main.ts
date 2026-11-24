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

import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const INPUT_DIR = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(join(INPUT_DIR, 'POST.json'), join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${INPUT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
