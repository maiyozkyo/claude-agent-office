---
description: Write this session's current team state to the local Agent Office (.agent-office/desks)
---

Follow the "Agent Office (local)" section of this project's AGENTS.md. Do this now, for this session only:

1. Pick (or reuse, if already picked earlier this conversation) a short `session` label — letters, digits, `.`, `_`, `~`,
   `-` only — distinct from other sessions you know are running. Keep it for the whole conversation.
2. List every role currently relevant in this session: yourself as PM, plus any subagent/helper you handed work to that is
   still running or whose result you haven't finished reviewing.
3. For each one, write `.agent-office/desks/<id>.json` at the project root (create the folder if missing), `id` =
   `<session>-<role-lowercase>` or `<session>-dev-<n>`:
   `{ "role": "PM"|"BA"|"Dev"|"QC", "status": "working"|"reviewing"|"done"|"blocked"|"idle", "label": "<short hint>", "session": "<label>", "updatedAt": "<ISO now>" }`
4. Delete the files of your own roles that have nothing running anymore.
5. Report in one short line which desks you wrote or deleted, then the link on its own line:
   `http://127.0.0.1:4317/#<session>`

Never touch files whose `session` isn't yours.
