# FRC Tools

A pair of standalone web tools for FRC events. Both are single HTML files — no build step, no dependencies, just open in a browser.

---

## frc_match_timer.html — Pit departure calculator

Helps your team know when to leave the pit to make it to the field on time.

- Enter your team number and event key to pull your match schedule live from [The Blue Alliance](https://www.thebluealliance.com)
- Adjust sliders for how far the field is running behind, your walk time from pit to field, and how early queue calls happen
- Shows a card for each match with a countdown to when you need to leave
- Auto-refresh keeps times current throughout the day

**Setup:** Open in any browser. Enter your TBA API key (get one free at [thebluealliance.com/account](https://www.thebluealliance.com/account)), your team number, and your event key (e.g. `2026onwin`).

---

## frc_lateness_tracker.html — Field lateness tracker

Helps field staff track which teams are habitually late to the field.

- Pulls the full event match schedule from TBA (no team filter — shows every match)
- Click any team chip to mark them as late on that match
- Flagged teams show a warning badge on all their future matches
- The banner at the top always shows the next upcoming match and calls out any flagged teams in it
- Flags persist across page refreshes via `localStorage`
- **Mock time** (in settings) lets you simulate a time of day for testing against completed events

**Setup:** Open in any browser. Click the ⚙ button and enter your TBA API key and optionally a simulated time for testing. Enter your event key and click Fetch.

### Keyboard of team chip states

| Appearance | Meaning |
|---|---|
| Normal chip | Team has no lateness history |
| Amber chip with `!` | Team has been marked late at a previous match |
| Red chip | Team was marked late on this specific match |

---

## Getting a TBA API key

1. Sign in at [thebluealliance.com](https://www.thebluealliance.com)
2. Go to [Account settings](https://www.thebluealliance.com/account)
3. Under **Read API Keys**, generate a new key
4. Paste it into the app's settings

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/frc-tools.git
git push -u origin main
```

You can also enable **GitHub Pages** (Settings → Pages → Deploy from branch → `main`) to host the tools online so anyone on your team can access them from a phone or laptop at the event without downloading anything.
