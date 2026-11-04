---
description: Remove desks from the Agent Office — this session's by default, or a named session, or all
argument-hint: "[session label | all]"
---

Arguments: `$ARGUMENTS`

1. Work out the mode the same way `/office-sync` does (an `## Agent Office (local)` section in AGENTS.md/CLAUDE.md →
   local; an Agent Office section with a `https://claude.ai/artifact/...` link → artifact; both → both, or the mode the
   user already chose this conversation).
2. Work out which session to clear:
   - no argument → this conversation's own session label (the one you used with `/office-sync` or the automatic desk
     updates). If you never picked one this conversation, list the sessions that exist and ask which to clear.
   - a label → that session. Labels are letters, digits, `.` `_` `~` `-` only; refuse anything else.
   - `all` → every session; first show how many desks per session will go and ask the user to confirm.
3. Delete that session's desks:
   - **local**: delete `.agent-office/desks/<session>-*.json` at the project root (for `all`: every `*.json` there).
     Only delete `.json` files inside that folder — nothing else.
   - **artifact**: `ArtifactData` `list` the `desks` collection on the office URL, then `delete` each doc whose `session`
     field (or the part of its id before the first `-`) matches — pin each delete with the `version` from the list.
4. If you cleared this conversation's own session, forget its label: the next `/office-sync` picks a new one.
5. Report in one line: which session(s) and how many desks were removed.
