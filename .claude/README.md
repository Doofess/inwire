# Claude Code in this repo

Everything here is **project scope**. It shapes Claude Code sessions in Inwire
and nothing else, and it is committed so every machine gets the same setup.
Per-machine choices go in settings.local.json beside it, which is gitignored.

The setup is a clean slate: no plugins, language servers, hooks, agents or
MCP servers. Only the project skills are here.

## What is here

| File | What it does |
|---|---|
| `.claude/settings.json` | Empty apart from its schema. Claude Code defaults apply |
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

## Testing it

- `npx tsx scripts/claude/setup.ts` checks the settings values, the skills'
  frontmatter and `paths:` globs, and the privacy rule. It runs in
  `npm run check`, and so on CI. A settings change takes effect in the next
  session, so try it with `claude -p` from the repo root.
