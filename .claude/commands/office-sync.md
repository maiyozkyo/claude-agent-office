---
description: Set up (first run) and write this session's team to your Agent Office artifact
---

## 0. First-run setup

Look for an `## Agent Office` section with a `https://claude.ai/artifact/...` link in this project's `CLAUDE.md` or
`AGENTS.md`. If it is there, go to step 1.

If not:
- Ask the user for their office artifact link. If they don't have one yet, tell them to publish
  `office-dashboard.html` from https://github.com/maiyozkyo/claude-agent-office as an artifact with capabilities
  `{ "db": {} }` (or offer to publish it for them if they give you the path to that file), then stop until you have it.
- Append the section between the `=====` lines below to `CLAUDE.md` at the project root (create it if missing) —
  verbatim, with one blank line before it, replacing every `<YOUR_ARTIFACT_URL>` with the link.
- Say in one line what you added, so the user can review/commit it.

=====
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
=====

## 1. Write this session's desks

1. Pick (or reuse, if already picked earlier this conversation) a short `session` label — letters, digits, `.`, `_`, `~`,
   `-` only (it goes into the link's `#`), distinct from other sessions you know are running. Keep it for the whole
   conversation.
2. List every role currently relevant in this session: yourself as PM, plus any BA/Dev/QC subagent you dispatched with the
   Agent tool that is still running or whose result you haven't finished reviewing.
3. For each one, write a document with the `ArtifactData` tool (`set`, or `update` with `if_version` after the first write)
   to the office URL, collection `desks`, doc id `<session>-<role-lowercase>` (PM/BA/QC) or `<session>-dev-<n>` (Dev,
   1-based among this session's current Dev desks):
   ```
   { role: "PM"|"BA"|"Dev"|"QC", status: "working"|"reviewing"|"done"|"blocked"|"idle", label: "<short file/task hint>", session: "<your label>", updatedAt: "<ISO now>" }
   ```
   Keep `label` to a short hint (a filename or a few words), never the brief text — the page may be shared.
4. For any role with nothing running anymore, delete its desk doc instead.
5. Report in one short line which desks you wrote or deleted, then this session's office link on its own line:
   `<office URL>#<session>`

Never touch desks whose `session` isn't yours.
