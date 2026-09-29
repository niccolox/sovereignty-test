/**
 * Refuses any change to an already-published specification version.
 *
 * A published version may already have been cited. Correcting it in place,
 * even a typo, silently changes what someone else referenced. Corrections ship
 * as a new version directory instead.
 *
 * A version counts as published once it exists in the base ref. Adding a
 * brand-new `spec/vN/` directory is always allowed.
 */

const base = process.argv[2] ?? "origin/master";

const sh = async (...cmd: string[]) => {
  const p = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const out = await new Response(p.stdout).text();
  await p.exited;
  return { code: p.exitCode ?? 0, out: out.trim() };
};

const merge = await sh("git", "merge-base", base, "HEAD");
if (merge.code !== 0) {
  console.log(`No merge base with ${base}; nothing published to protect yet.`);
  process.exit(0);
}

const changed = await sh("git", "diff", "--name-only", `${merge.out}..HEAD`);
const touched = changed.out.split("\n").filter((f) => /^spec\/v[^/]+\//.test(f));
if (touched.length === 0) {
  console.log("No published specification path was touched.");
  process.exit(0);
}

const violations: string[] = [];
for (const file of touched) {
  const dir = file.split("/").slice(0, 2).join("/");
  const existed = await sh("git", "cat-file", "-e", `${merge.out}:${file}`);
  if (existed.code === 0) violations.push(`${file} (in published ${dir})`);
}

if (violations.length > 0) {
  console.error("Refusing to modify an already-published specification version:\n");
  for (const v of violations) console.error(`  - ${v}`);
  console.error(
    "\nA published version may already have been cited. Ship the correction as a new version directory, for example spec/v1.1/.",
  );
  process.exit(1);
}
console.log(`Only new specification paths were added: ${touched.join(", ")}`);
