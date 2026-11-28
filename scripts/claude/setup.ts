/**
 * The repo's Claude Code setup is what `.claude/README.md` says it is.
 *
 *   npx tsx scripts/claude/setup.ts
 *
 * Everything here is project scope on purpose: the owner's rule is that this
 * repo's Claude Code setup changes nothing outside it. The setup is a clean
 * slate: no plugins, hooks, agents or MCP servers, only the project skills.
 *
 * The repo is public, so nothing committed under `.claude/` may carry a personal path or an email address. It reads only tracked files
 * and the ones it names, so it passes the same on CI's clean clone.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

let failures = 0;
function check(name: string, pass: boolean, detail = ''): void {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${pass || !detail ? '' : ` - ${detail}`}`);
  if (!pass) failures++;
}

function readJson(file: string): Record<string, unknown> | null {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const settings = readJson('.claude/settings.json');
check('.claude/settings.json parses', settings !== null);

// Clean slate: the project switches on nothing, and claude.ai connectors
// follow the user's defaults.
for (const key of ['enabledPlugins', 'hooks', 'enabledMcpjsonServers', 'disableClaudeAiConnectors']) {
  check(`.claude/settings.json sets no ${key}`, settings !== null && !(key in settings));
}
check('the project has no .mcp.json', !existsSync('.mcp.json'));
check('the project has no hooks folder', !existsSync('.claude/hooks'));

const ignored = readFileSync('.gitignore', 'utf8').split(/\r?\n/);
check('.gitignore keeps per-machine settings out', ignored.includes('.claude/settings.local.json'));
check('.gitignore keeps worktrees out', ignored.includes('.claude/worktrees/'));

/** The frontmatter of a Markdown file as flat `key: value` strings. */
function frontmatter(file: string): Record<string, string> {
  const m = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fields: Record<string, string> = {};
  for (const line of m?.[1].split(/\r?\n/) ?? []) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].trim();
  }
  return fields;
}

/** Exact globs, never a walk of `.claude/`: its worktrees hold whole checkouts. */
function inDir(dir: string, pick: (name: string) => string | null): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .map((e) => pick(e.isDirectory() ? `${e.name}/` : e.name))
    .filter((f): f is string => f !== null && existsSync(path.join(dir, f)))
    .map((f) => `${dir}/${f}`);
}
const skillFiles = inDir('.claude/skills', (n) => (n.endsWith('/') ? `${n}SKILL.md` : null));
check('the project has no agents', inDir('.claude/agents', (n) => (n.endsWith('.md') ? n : null)).length === 0);

// Skills: each is listed in full so Claude can pick it, and a `paths:` scope
// that matches no file would quietly never load it.
const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
function globToRegExp(glob: string): RegExp {
  const body = glob.split('**').map((part) => part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')).join('.*');
  return new RegExp(`^${body}$`);
}
for (const skill of ['inwire-verify', 'inwire-launch', 'inwire-visual-design']) {
  check(`skill ${skill} exists`, skillFiles.includes(`.claude/skills/${skill}/SKILL.md`));
}
for (const file of skillFiles) {
  const fm = frontmatter(file);
  const folder = path.basename(path.dirname(file));
  check(`${folder}: frontmatter name matches its folder`, fm.name === folder, fm.name);
  const length = (fm.description ?? '').length;
  check(`${folder}: description is listed in full (50-1024 chars)`, length >= 50 && length <= 1024, `${length} chars`);
  if (fm.paths !== undefined) {
    let globs: string[] = [];
    try { globs = JSON.parse(fm.paths) as string[]; } catch { /* reported below */ }
    check(`${folder}: paths is a one-line list`, Array.isArray(globs) && globs.length > 0, fm.paths);
    for (const glob of globs) {
      const re = globToRegExp(glob);
      check(`${folder}: paths ${glob} matches a tracked file`, tracked.some((f) => re.test(f)));
    }
  }
}
if (skillFiles.includes('.claude/skills/inwire-visual-design/SKILL.md')) {
  check('inwire-visual-design is scoped to the files it governs', frontmatter('.claude/skills/inwire-visual-design/SKILL.md').paths !== undefined);
}
// Per machine and gitignored, so absent on CI: checked only where it exists.
const local = readJson('.claude/settings.local.json');
if (local) check('no local override hides a project skill', !('skillOverrides' in local));

/**
 * A personal path or an email address in a public file. Generic on purpose:
 * naming the owner's profile folder here would publish the very thing it
 * guards. `example.invalid` is the reserved address the hook tests commit as.
 */
const PERSONAL = /[A-Z]:[\\/](Users|dev)[\\/]|\/[a-z]\/Users\/|[\w.+-]+@(?!example\.invalid\b)[\w-]+\.[\w.]+/i;
const committed = ['.claude/settings.json', '.claude/README.md', ...skillFiles, 'scripts/claude/setup.ts'];
for (const file of committed.filter((f) => existsSync(f))) {
  const hit = readFileSync(file, 'utf8').match(PERSONAL);
  check(`${file} carries nothing personal`, hit === null, hit?.[0]);
}

if (failures) {
  console.log(`${failures} check(s) FAILED`);
  process.exit(1);
}
console.log('Claude Code project setup holds.');
process.exit(0);
