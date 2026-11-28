# Claude Code in this repo

Everything here is **project scope**. It shapes Claude Code sessions in Inwire
and nothing else, and it is committed so every machine gets the same setup.
Per-machine choices go in settings.local.json beside it, which is gitignored.

The setup is a clean slate: no plugins, language servers, agents or project
MCP servers. The project skills and one safety hook are here. claude.ai
connectors are left at the account's defaults on purpose.

## What is here

| File | What it does |
|---|---|
| `.claude/settings.json` | Wires the guard-shell hook and nothing else. Claude Code defaults apply |
| `.claude/hooks/guard-shell.mjs` | Before every Bash and PowerShell call: blocks Windows-side Python (the Store stub hangs the shell; WSL is fine), an `npm run check` held in the foreground without `run_in_background` or a 600000 ms timeout, and npm that writes `node_modules` where `node_modules` is a link |
| `.claude/skills/inwire-verify/SKILL.md` | Picks checks from the changed paths, then runs the full gate in the background and quotes the output |
| `.claude/skills/inwire-launch/SKILL.md` | Launches the real app in the background with a throwaway profile, then screenshots every state in both themes |
| `.claude/skills/inwire-visual-design/SKILL.md` | Typography, themes and the brand mark. Loads when UI files are touched |

## Rules for changing it

- **Change files here, never user scope.** Plugin switches go in
  `enabledPlugins` in `.claude/settings.json`. Never run
  `claude plugin enable` or `claude plugin disable` without `--scope`, nor
  `claude plugin marketplace add`, `claude mcp add`, the `/mcp` toggle or
  the claude.ai sync switches. Each of those writes to user scope and would
  change every other project.
- **This repo is public.** No personal paths, user names or email addresses
  in anything committed here. `scripts/claude/setup.ts` fails on them.
- **A new worktree has no `node_modules`.** Run `npm ci` in it before `tsx`,
  `tsc` or the checks. If you junction main's copy in instead, never run npm
  through the junction: guard-shell refuses it, because npm would empty and
  rewrite main's packages.
- **The hook is plain Node with no dependencies, and it fails open.** A hook
  that cannot read its input allows the call. It is a guard against slips,
  not a security boundary: native Windows has no sandbox.

## Testing it

- `npx tsx scripts/claude/setup.ts` checks the settings values, the hook
  wiring, the skills' frontmatter and `paths:` globs, and the privacy rule.
- `npx tsx scripts/claude/hooks.ts` runs the guard as a child process against
  every allow and deny row.
- Both scripts run in `npm run check`, and so on CI. A settings change takes
  effect in the next session, so try it with `claude -p` from the repo root.
