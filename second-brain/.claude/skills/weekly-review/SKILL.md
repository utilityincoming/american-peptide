---
name: weekly-review
description: Sweep the second brain weekly — surface open loops, stale projects, and things to log or decide. Use when the user asks for a weekly review or to review the second brain.
---

# Weekly Review

A playbook for a ~15 minute sweep of the second brain. Produce a short written
summary at the end; don't change files unless asked.

## Steps

1. **Projects.** Read every file in `projects/`. For each, note its status,
   where it paused, and its next step. Flag any that are `active` but haven't
   been updated in 2+ weeks (check `Updated:` date).

2. **Open loops.** Grep the whole folder for `TODO`, `FIXME`, `?`, and
   `next step` to collect loose ends.

3. **Drafts.** List everything in `drafts/` with its status. Flag drafts stuck
   in `revising` with no recent update.

4. **People.** Note anyone in `people/` with a pending follow-up in their
   `## History` or notes.

5. **Decisions.** Skim `decisions.md` — anything decided this week worth
   broadcasting, or any decision now contradicted by events?

6. **Summarize.** Output:
   - **Top 3 priorities** for the coming week.
   - **Open loops** (bulleted).
   - **Stale / needs attention** (projects, drafts, follow-ups).
   - **Suggested logs** — anything that should be captured as a note or a
     `decisions.md` entry.

## Notes
- Read-only by default. Only edit files when the user explicitly asks.
- Keep the summary scannable — bullets over prose.
