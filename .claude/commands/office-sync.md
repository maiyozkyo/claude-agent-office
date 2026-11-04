---
description: Write this session's current team state (PM/BA/Dev/QC) to your Agent Office artifact
---

Find the office artifact URL in the "Agent Office" section of this project's CLAUDE.md or AGENTS.md (a
`https://claude.ai/artifact/...` link). If there is none, tell the user to follow the setup in
https://github.com/maiyozkyo/claude-agent-office#setup and stop.

Then, for this session only:

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
