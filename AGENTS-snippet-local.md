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
