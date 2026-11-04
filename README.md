# Claude Agent Office

A little chibi office that shows your Claude Code agent team at work — the coordinator session as the boss on a raised
loft, and the subagents it dispatches (Dev, BA, QC) at their desks below. Characters type, review, get stuck, celebrate,
doze off when idle, and fake-type when the boss walks by. View it in 3D or 2D.

It is **observe-only**: you keep giving work to Claude in your terminal as usual; the page just shows who is doing what.

## How it works

- The page is a single HTML file you publish as a **claude.ai Artifact** in your own account. The artifact's small
  database holds one document per desk.
- Your coordinator session writes desk state there with the built-in `ArtifactData` tool — when it dispatches a
  subagent, when a result comes back, when something gets blocked. No server, no API key, no extra model calls; each
  write is one small tool call.
- Every session picks a short label, so each one gets its own office at `<your artifact URL>#<label>`. The URL without
  `#` shows all sessions in one room.

## Setup

You need Claude Code signed in with a claude.ai account that can publish Artifacts.

1. **Publish the page.** In Claude Code, from a folder containing `office-dashboard.html`, ask:
   > Publish office-dashboard.html as an artifact with capabilities `{ "db": {} }`.

   Copy the `https://claude.ai/artifact/...` link it gives you.
2. **Tell your project about it.** Paste the contents of [`CLAUDE-snippet.md`](CLAUDE-snippet.md) into your project's
   `CLAUDE.md` (or `AGENTS.md`), replacing `<YOUR_ARTIFACT_URL>` with your link.
3. **Add the command.** Copy [`.claude/commands/office-sync.md`](.claude/commands/office-sync.md) into your project's
   `.claude/commands/` (or `~/.claude/commands/` to use it everywhere).
4. **Try it.** In a session, type `/office-sync`. It writes the current desks and prints this session's office link.
   From then on the coordinator updates the office by itself whenever it hands out or reviews work.

To update the page later, edit `office-dashboard.html` and ask Claude Code to republish it to the same artifact URL.

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
claude.ai to see the desks.

## License

[MIT](LICENSE)
