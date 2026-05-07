# Session Instructions

Read CLAUDE.md and AGENTS.md to understand the project context and current status.
Then read any files referenced with @include directives.

After reading project context, gather and report the following so the user can pick up where they left off:

1. **Last work in progress** — Inspect `git status` to see uncommitted changes (modified, deleted, untracked). Summarize what files/areas are mid-flight and what they suggest is being worked on. If the working tree is clean, say so.

2. **Last commit** — Run `git log -1 --stat` (or equivalent) and report the most recent commit's subject, date, and the files it touched. Briefly summarize what shipped.

3. **Roadmap status** — Look for a roadmap or planning document in the repo. Check, in order:
   - `ROADMAP.md`, `TODO.md`, `PLAN.md` at the project root
   - `docs/roadmap*`, `docs/plan*`, `docs/todo*`
   - Anything referenced from `CLAUDE.md` or `AGENTS.md` as the source of truth for planned work
   
   If found, list completed items (checked/struck-through) and outstanding items (unchecked). If no roadmap exists, say so explicitly — don't fabricate one.

4. **Suggested next item** — Based on the above (uncommitted work first, then the next outstanding roadmap item, then the most logical follow-on to the last commit), recommend one concrete next task. Frame it as a suggestion the user can redirect, not a decided plan.

Keep the report concise — short bullets per section, no prose padding. Run the git/file lookups in parallel where possible.
