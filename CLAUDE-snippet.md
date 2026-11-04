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
