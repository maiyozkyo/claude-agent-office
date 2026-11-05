# Claude Agent Office

A little chibi office that shows your AI agent team at work — the coordinator session as the boss on a raised loft, and
the subagents it hands work to (Dev, BA, QC) at their desks below. Characters type, review, get stuck, celebrate, doze
off when idle, and fake-type when the boss pops up nearby. Finished agents teleport to the pantry for a coffee (and leave after 10 s when the team is at full
strength). Everyone teleports — nobody walks. View it in 3D or 2D.

It is **observe-only**: you keep giving work to your agent in the terminal as usual; the page just shows who is doing
what.

## Two ways to run it

| | **Artifact mode** (Claude Code + claude.ai) | **Local mode** (Codex, Claude Code, any agent) |
|---|---|---|
| Where the page lives | A claude.ai Artifact in your account | `node server.js` on your machine → `http://127.0.0.1:4317` |
| How agents report | The built-in `ArtifactData` tool | Writing small JSON files in `.agent-office/desks/` |
| Needs | Claude Code signed in to claude.ai | Node 18+ (no npm install) |
| View from other devices | Yes, signed in to claude.ai (or shared) | Only this machine, unless you expose the port yourself |

Either way, each session picks a short label and gets its own office at `<page URL>#<label>`; the URL without `#` shows
all sessions in one room. Desk updates cost no extra model calls — one small tool call or file write each.

## Setup

1. **Add the command** — one file for every agent and both modes:
   - Claude Code: copy [`.claude/commands/office-sync.md`](.claude/commands/office-sync.md) into your project's
     `.claude/commands/` (or `~/.claude/commands/` to use it everywhere) and run `/office-sync`.
   - Codex: copy the same file to `~/.codex/prompts/` and run it as a custom prompt (see your Codex version's docs for
     how custom prompts are invoked).
2. **Run it** in a session. The first time, it asks whether you want **local**, **artifact** or **both**, and sets the
   project up:
   - local: adds the "Agent Office (local)" section to `AGENTS.md` (same text as
     [`AGENTS-snippet-local.md`](AGENTS-snippet-local.md)), `.agent-office/` to `.gitignore`, and creates the folder;
   - artifact: asks for your artifact link and adds the "Agent Office" section to `CLAUDE.md` (same text as
     [`CLAUDE-snippet.md`](CLAUDE-snippet.md)).

   Then it writes the current desks and prints this session's link(s). From then on the coordinator updates the office
   by itself whenever it hands out or reviews work.
3. **Open the office.**
   - Local: from this folder run `node server.js --dir /path/to/your-project/.agent-office` (repeat `--dir` to watch
     several projects; `--port` default 4317, `--host` default `127.0.0.1`) and open `http://127.0.0.1:4317`.
   - Artifact: publish the page once — in Claude Code, from this folder, ask
     "Publish office-dashboard.html as an artifact with capabilities `{ "db": {} }`" — and give that link to
     `/office-sync`. To update the page later, edit `office-dashboard.html` and republish it to the same URL.

Agents write plain files, so it works even inside sandboxes that block network access. Each desk is
`.agent-office/desks/<id>.json`:

```json
{ "role": "Dev", "status": "working", "label": "auth.ts", "session": "main", "updatedAt": "2026-01-01T12:00:00Z" }
```

Delete the file to remove the desk. You can also drive it by hand or from scripts.

### Sessions

A session is just the desks whose id starts with its label. A new conversation that runs `/office-sync` (or hands out
work) appears as a new session in the picker. Desks stay after a conversation ends (they fade after 15 min without an
update), so clear them with **`/office-clear`** — copy
[`.claude/commands/office-clear.md`](.claude/commands/office-clear.md) next to `office-sync.md`:

- `/office-clear` — this conversation's session
- `/office-clear cool` — the session labelled `cool`
- `/office-clear all` — every session (asks first)

By hand (local): delete `.agent-office/desks/<label>-*.json`.

## On the page

- **2D / 3D** switch in the header (remembered per browser).
- **Name the team**: office name, a default number of desks per role, and per person a name, gender, hairstyle (14
  styles, from Cap to Afro to HKT spikes) and hair/shirt colors. Saved in your browser only.
- **Session picker**: one session's office, or all of them.
- **3D fun** (purely visual, nothing is written anywhere): right-click (long-press on touch) a character to 👊 punch
  someone, 👊👊 gang-punch them, or 📄 throw a paper ball. Punchers power up (golden spiky hair, a gold aura), dash in
  and punch one after another round a ring; the last punch knocks the target flying — it lies 3 s, then teleports
  home. The boss teleports to patrol now and then or ⚡ zap, then back to the desk; finished work gets confetti.
- **★ Boss bar** (bottom-left of the 3D office): one click for the whole team — ⚡ the boss turns storm god (a winged
  helm; a war hammer and a storm axe fly in and cross overhead) and drops a column of lightning on everyone, who
  stay sooty and smoking for 3 s, 📄 a paper ball at each person, 👊 a punch round (the boss flies straight from one
  knocked-out person to the next, home after the last), ☕ a 10 s coffee break in the pantry.
- Characters vent censored outbursts (`#@!%`) with a fiery angry face when work is hard.
- **Stale after N min** (Team drawer, default 15, 0 = off): a working / reviewing / blocked desk with no update for
  that long fades and the boss ⚡ zaps it; a working desk's pill shows how long it has been working.
  **⚡ Zap = remind the PM**: in local mode both settings are saved to `<dir>/config.json`
  (`{ "staleMinutes": 15, "zapRemindsPm": true }`, the one file the server writes) so a Claude Code hook in the
  project can warn the coordinator session about stale desks; untick it and the zap is only an animation.

## Privacy

Artifacts are private by default. If you share yours (Share menu on the page), viewers see the desk labels your
sessions write — keep them to short hints like file names. Viewers outside your organization must be signed in to
claude.ai to see the desks. The local server listens on `127.0.0.1` only unless you pass `--host`.

## License

[MIT](LICENSE)
