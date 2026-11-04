# Claude Agent Office

A little chibi office that shows your AI agent team at work — the coordinator session as the boss on a raised loft, and
the subagents it hands work to (Dev, BA, QC) at their desks below. Characters type, review, get stuck, celebrate, doze
off when idle, and fake-type when the boss walks by. View it in 3D or 2D.

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

## Setup: artifact mode (Claude Code)

1. **Publish the page.** In Claude Code, from this folder, ask:
   > Publish office-dashboard.html as an artifact with capabilities `{ "db": {} }`.

   Copy the `https://claude.ai/artifact/...` link it gives you.
2. **Tell your project about it.** Paste [`CLAUDE-snippet.md`](CLAUDE-snippet.md) into your project's `CLAUDE.md` (or
   `AGENTS.md`), replacing `<YOUR_ARTIFACT_URL>` with your link.
3. **Add the command.** Copy [`.claude/commands/office-sync.md`](.claude/commands/office-sync.md) into your project's
   `.claude/commands/` (or `~/.claude/commands/` to use it everywhere).
4. **Try it.** In a session, type `/office-sync`. It writes the current desks and prints this session's office link.
   From then on the coordinator updates the office by itself whenever it hands out or reviews work.

To update the page later, edit `office-dashboard.html` and ask Claude Code to republish it to the same artifact URL.

## Setup: local mode (Codex or any agent)

1. **Start the office** (from this folder; point `--dir` at your project's `.agent-office` folder — repeat `--dir` to
   watch several projects):
   ```bash
   node server.js --dir /path/to/your-project/.agent-office
   ```
   Open `http://127.0.0.1:4317`. Options: `--port` (default 4317), `--host` (default `127.0.0.1`).
2. **Tell your agent.** Paste [`AGENTS-snippet-local.md`](AGENTS-snippet-local.md) into your project's `AGENTS.md`
   (Codex reads it) or `CLAUDE.md`. Add `.agent-office/` to the project's `.gitignore`.
3. **Optional command.**
   - Codex: copy [`codex/prompts/office-sync.md`](codex/prompts/office-sync.md) to `~/.codex/prompts/` and run it as a
     custom prompt (check your Codex version's docs for how custom prompts are invoked).
   - Claude Code in local mode: same file into `.claude/commands/`.
4. **Try it.** Run the command (or just ask the agent to "write my desks to the agent office"), then open
   `http://127.0.0.1:4317/#<session>`.

Agents write plain files, so it works even inside sandboxes that block network access. Each desk is
`.agent-office/desks/<id>.json`:

```json
{ "role": "Dev", "status": "working", "label": "auth.ts", "session": "main", "updatedAt": "2026-01-01T12:00:00Z" }
```

Delete the file to remove the desk. You can also drive it by hand or from scripts.

## On the page

- **2D / 3D** switch in the header (remembered per browser).
- **Name the team**: office name, a default number of desks per role, and per person a name, gender, hairstyle (14
  styles, from Cap to Afro to HKT spikes) and hair/shirt colors. Saved in your browser only.
- **Session picker**: one session's office, or all of them.
- **3D fun** (purely visual, nothing is written anywhere): right-click (long-press on touch) a character to 👊 punch
  someone, 👊👊 gang-punch them, or 📄 throw a paper ball. The boss patrols now and then; finished work gets confetti.
- Characters vent censored outbursts (`#@!%`) with a fiery angry face when work is hard.

## Privacy

Artifacts are private by default. If you share yours (Share menu on the page), viewers see the desk labels your
sessions write — keep them to short hints like file names. Viewers outside your organization must be signed in to
claude.ai to see the desks. The local server listens on `127.0.0.1` only unless you pass `--host`.

## License

[MIT](LICENSE)
