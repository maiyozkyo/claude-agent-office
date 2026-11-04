---
description: Write this session's agent team to the Agent Office (artifact and/or local), setting it up on first run
---

## 0. Which office does this project use?

Read this project's `CLAUDE.md` and `AGENTS.md` (project root) and decide the mode:
- **local** — there is an `## Agent Office (local)` section.
- **artifact** — there is an Agent Office / office dashboard section with a `https://claude.ai/artifact/...` link.
- **both** — both are there: unless you already asked earlier this conversation, ask the user which office to use for
  this session — **local**, **Claude (artifact)** or **both** — and remember the answer for the rest of the conversation.
  That choice also decides where your automatic desk updates go (the AGENTS.md/CLAUDE.md sections) from now on; do steps
  1–2 only for the chosen mode(s).
- **neither** — first run: ask the user which they want (local, artifact or both), then do the setup below. Artifact mode
  needs the `ArtifactData` tool (Claude Code signed in to claude.ai); if you don't have it, only offer local.

### Setup: local
- Append the section between the `===== LOCAL` lines below to `AGENTS.md` (create it if missing), verbatim, with one blank
  line before it.
- Add a `.agent-office/` line to `.gitignore` (create the file if missing), and create `.agent-office/desks/`.
- Tell the user to start the office if it isn't running:
  `node server.js --dir <this project>/.agent-office` from the claude-agent-office folder.

### Setup: artifact
- Ask for the user's office artifact link. If they have none, tell them to publish `office-dashboard.html` from
  https://github.com/maiyozkyo/claude-agent-office as an artifact with capabilities `{ "db": {} }` (offer to do it if they
  give you the path), and stop until you have the link.
- Append the section between the `===== ARTIFACT` lines below to `CLAUDE.md` (create it if missing), verbatim, with one
  blank line before it, replacing every `<YOUR_ARTIFACT_URL>` with the link.

After any setup, say in one line what you added so the user can review and commit it.

===== LOCAL
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
===== LOCAL

===== ARTIFACT
## Agent Office

A live chibi office of this session's agent team is published at `<YOUR_ARTIFACT_URL>` (observe-only — never a control
surface). When you are the coordinator (the session the user talks to) and you use subagents, mirror the team there with
the `ArtifactData` tool: collection `desks`, one document per desk, doc id `<session>-<role-lowercase>` or
`<session>-dev-<n>`, where `session` is a short label you pick for yourself (letters, digits, `.` `_` `~` `-`) and keep
for the whole conversation. Write (`set`, or `update` pinned with `if_version` after the first write) only at these
moments — a missed write just desyncs the picture, it never affects real work:

- before calling `Agent(...)` for a brief → `{ role: "PM"|"BA"|"Dev"|"QC", status: "working", label: "<short file/task hint>", session, updatedAt: <ISO now> }`
- right after a subagent's result arrives → `status: "reviewing"` (you reading its work), then `"done"`, or `"blocked"`
  on a reported problem
- when a role has nothing running anymore → `delete` that desk doc

Keep `label` to a short hint (a filename or a few words), never the brief text — the page may be shared. `/office-sync`
writes a snapshot on demand and prints this session's link (`<YOUR_ARTIFACT_URL>#<session>`).
===== ARTIFACT

## 1. Pick the desks

1. Pick (or reuse, if already picked earlier this conversation) a short `session` label — letters, digits, `.`, `_`, `~`,
   `-` only (it goes into the link's `#`), distinct from other sessions you know are running. Keep it for the whole
   conversation.
2. List every role currently relevant in this session: yourself as PM, plus any BA/Dev/QC subagent or helper you handed
   work to that is still running or whose result you haven't finished reviewing. Desk id: `<session>-<role-lowercase>`
   (PM/BA/QC) or `<session>-dev-<n>` (Dev, 1-based among this session's current Dev desks). Content:
   `{ role: "PM"|"BA"|"Dev"|"QC", status: "working"|"reviewing"|"done"|"blocked"|"idle", label: "<short hint>", session: "<label>", updatedAt: "<ISO now>" }`
   Keep `label` to a short hint (a file name or a few words), never the task text.

## 2. Write them (for each mode in use)

- **local**: write `.agent-office/desks/<id>.json` at the project root with that content; delete the files of your own
  roles that have nothing running anymore.
- **artifact**: `ArtifactData` on the office URL, collection `desks`, doc id `<id>` — `set` (or `update` with `if_version`
  after the first write); `delete` your own roles that have nothing running anymore.

Never touch desks whose `session` isn't yours.

## 3. Report

One short line with the desks you wrote or deleted, then this session's link(s), each on its own line:
`http://127.0.0.1:4317/#<session>` (local) and/or `<artifact URL>#<session>` (artifact).
