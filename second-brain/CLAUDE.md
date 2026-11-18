# Second Brain

Layer 1: the map. Keep this file under 200 lines. It tells any agent (and
future-you) where things live and how to move around. Details live in the
folders; this file just points.

## What this is
A personal knowledge base: notes, people, projects, and drafts, kept as plain
markdown so it stays searchable, diffable, and portable. One idea per file.

## Layout
- `CLAUDE.md` — this map (Layer 1). Read first, keep short.
- `CLAUDE.local.md` — private scratch notes for this folder. Gitignored.
- `decisions.md` — append-only log of choices and why.
- `notes/` — one topic per file. Reference material, ideas, learnings.
- `people/` — one person or company per file. Context, history, links.
- `projects/` — one project per file: status, where you paused, next step.
- `drafts/` — writing in progress.
- `.claude/rules/` — Layer 2: focused rules loaded only for matching paths.
- `.claude/skills/` — Layer 3: playbooks (e.g. weekly-review).

## Conventions
- Filenames: `kebab-case.md`. One subject per file.
- Top of every file: a one-line summary, then an updated date.
- Link between files with relative paths, e.g. `[Acme](../people/acme.md)`.
- Dates as `YYYY-MM-DD`.
- Prefer appending over rewriting history in `decisions.md`.

## How to work here
1. Start a task by reading this map, then the relevant folder's file(s).
2. Capturing something new? Pick the right folder and make a new file.
3. A real choice with tradeoffs? Log it in `decisions.md`.
4. Weekly, run the `weekly-review` skill to sweep open loops.

## Layered context (why the folders)
- Layer 1 (this file): always loaded, stays small so it's cheap to read.
- Layer 2 (`.claude/rules/*`): loaded only when touching matching paths, so
  specialized guidance doesn't bloat every request.
- Layer 3 (`.claude/skills/*`): multi-step playbooks run on demand.

## Current focus
_(Update this line as priorities shift.)_
- See `projects/` for active work.
