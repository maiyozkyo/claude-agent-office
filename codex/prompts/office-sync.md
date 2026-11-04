---
description: Set up (first run) and write this session's team to the local Agent Office (.agent-office/desks)
---

## 0. First-run setup (skip the parts that are already done)

Work at the project root (the folder with `AGENTS.md`/`CLAUDE.md`, or the git root).

- If neither `AGENTS.md` nor `CLAUDE.md` contains a heading `## Agent Office (local)`, append the section between the
  `=====` lines below to `AGENTS.md` (create it if missing) — verbatim, with one blank line before it.
- If `.gitignore` exists and has no `.agent-office/` line, append `.agent-office/`. If there is no `.gitignore`, create one
  with that line.
- Create `.agent-office/desks/` if missing.
- If you changed anything, say in one line what you added (so the user can review/commit it), and remind them to run
  `node server.js --dir <this project>/.agent-office` from the claude-agent-office folder if the office isn't open.

=====
## Agent Office (local)

A live chibi office of this session's agent team runs locally (`node server.js --dir <this project>/.agent-office` from
the [claude-agent-office](https://github.com/maiyozkyo/claude-agent-office) folder, then open `http://127.0.0.1:4317`).
It is observe-only. When you are the coordinator (the session the user talks to) and you hand work to subagents or
helpers, mirror the team by writing small JSON files — nothing else, no network calls:

- Folder: `.agent-office/desks/` at the project root (create it if missing; it should be gitignored).
- One file per desk, `<id>.json`, where `id` is `<session>-<role-lowercase>` (PM/BA/QC) or `<session>-dev-<n>` (Dev,
  1-based). `session` is a short label you pick for yourself (letters, digits, `.` `_` `~` `-`) and keep for the whole
  conversation.
- Content:
  ```json
  { "role": "PM", "status": "working", "label": "short file/task hint", "session": "main", "updatedAt": "2026-01-01T12:00:00Z" }
  ```
  `role`: `PM` | `BA` | `Dev` | `QC`. `status`: `idle` | `working` | `reviewing` | `done` | `blocked`.
- Write the file (whole content, then rename a temp file over it if you can) only at these moments — a missed write just
  desyncs the picture, it never affects real work:
  - before handing a task to a subagent/helper → that desk `working`
  - right after its result arrives → `reviewing` (you checking its work), then `done`, or `blocked` on a reported problem
  - when a role has nothing running anymore → delete that desk's file
- Keep `label` to a short hint (a file name or a few words), never the task text.

This session's office: `http://127.0.0.1:4317/#<session>`.
=====

## 1. Write this session's desks

1. Pick (or reuse, if already picked earlier this conversation) a short `session` label — letters, digits, `.`, `_`, `~`,
   `-` only — distinct from other sessions you know are running. Keep it for the whole conversation.
2. List every role currently relevant in this session: yourself as PM, plus any subagent/helper you handed work to that is
   still running or whose result you haven't finished reviewing.
3. For each one, write `.agent-office/desks/<id>.json` at the project root, `id` = `<session>-<role-lowercase>` or
   `<session>-dev-<n>`:
   `{ "role": "PM"|"BA"|"Dev"|"QC", "status": "working"|"reviewing"|"done"|"blocked"|"idle", "label": "<short hint>", "session": "<label>", "updatedAt": "<ISO now>" }`
4. Delete the files of your own roles that have nothing running anymore.
5. Report in one short line which desks you wrote or deleted, then the link on its own line:
   `http://127.0.0.1:4317/#<session>`

Never touch files whose `session` isn't yours.
