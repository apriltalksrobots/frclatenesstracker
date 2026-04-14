# FRC Tools

A pair of standalone web tools for FRC events, powered by [The Blue Alliance](https://www.thebluealliance.com). Both are single HTML files — no build step, no dependencies, just open in a browser.

No TBA API key needed by end users. The key lives in a Cloudflare Worker proxy that you deploy once.

---

## Tools

### frc_lateness_tracker.html — Field lateness tracker

For field managers. Shows the full event match schedule and lets you flag teams that arrive late to the field. Flagged teams get a warning badge on all future matches, and a banner at the top always shows the next match with any flagged teams called out.

- Click any team chip to mark them late on that match
- Flags persist across page refreshes
- Mock time (in ⚙ settings) lets you test against completed events

### frc_match_timer.html — Pit departure calculator

For teams. Shows your upcoming matches and counts down when you need to leave the pit to make queue on time.

- Adjustable sliders for field delay, walk time, and queue call window
- Auto-refresh keeps times current

---

## Setup

### 1. Deploy the proxy worker

The tools fetch data through a Cloudflare Worker that holds your TBA API key. This is a one-time setup.

**Get a free TBA API key:**
1. Sign in at [thebluealliance.com](https://www.thebluealliance.com)
2. Go to [Account → Read API Keys](https://www.thebluealliance.com/account)
3. Generate a new key

**Deploy the worker:**

```bash
cd worker
npm install -g wrangler      # install Cloudflare's CLI (one-time)
wrangler login               # sign in to Cloudflare (free account)
wrangler deploy              # deploy the worker
wrangler secret put TBA_API_KEY   # paste your TBA key when prompted
```

Your worker URL will be printed after deploy — it looks like:
```
https://frc-tba-proxy.YOUR_SUBDOMAIN.workers.dev
```

### 2. Update the proxy URL in the HTML files

In both `frc_lateness_tracker.html` and `frc_match_timer.html`, find this line near the bottom:

```js
const PROXY_URL = 'https://frc-tba-proxy.YOUR_SUBDOMAIN.workers.dev';
```

Replace `YOUR_SUBDOMAIN` with your actual Cloudflare subdomain.

### 3. Host on GitHub Pages (optional but recommended)

Push to GitHub and enable Pages (Settings → Pages → Deploy from branch → `main`). Your tools will be live at:

```
https://YOUR_USERNAME.github.io/frc-tools/frc_lateness_tracker.html
https://YOUR_USERNAME.github.io/frc-tools/frc_match_timer.html
```

Anyone on your team can open these links on any device — no download, no API key needed.

---

## Pushing to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/frc-tools.git
git push -u origin main
```

---

## Cloudflare free tier

The Worker uses Cloudflare's free tier which includes 100,000 requests/day — more than enough for any FRC event.

---

## Credits

Data provided by [The Blue Alliance](https://www.thebluealliance.com). Please link back to TBA from any derivative tools per their [developer guidelines](https://www.thebluealliance.com/apidocs).
