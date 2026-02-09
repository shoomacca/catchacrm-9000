# Genesis ECC Upgrades

This repo ships ECC-derived hooks, rules, skills, commands, and worktree support.

## Hooks

Copy hooks into your Claude Code settings:

1. Open `hooks/hooks.json`.
2. Merge its `hooks` block into your `~/.claude/settings.json`.
3. Restart Claude Code.

OpenCode note: it does not read Claude Code settings. Use project scripts or run formatters manually.

## LSP Plugin (TypeScript)

Install the TypeScript LSP plugin for inline diagnostics:

```bash
claude plugin marketplace add https://github.com/anthropics/claude-plugins-official
claude plugin install typescript-lsp@claude-plugins-official
```

OpenCode note: run `npx tsc --noEmit` as part of shard verification.

## Worktrees

Worktrees are controlled by `.antigravity/config.json`:

```json
"worktrees": {
  "enabled": true,
  "baseDir": "build",
  "branchPrefix": "shard/",
  "maxConcurrent": 2,
  "cleanupOnSuccess": true
}
```

Manual worktree commands:

```bash
node scripts/ng-worktree.js M01/M01_01_SCHEMA.md
node scripts/ng-worktree-merge.js M01/M01_01_SCHEMA.md
```

OpenCode note: worktrees are CLI-driven and do not require IDE support.

## OpenCode Helper

Run formatters + TypeScript checks for OpenCode sessions:

```bash
node scripts/ng-opencode-verify.js
```
