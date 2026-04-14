# FRC Tools

Two standalone web tools for FRC events powered by [The Blue Alliance](https://www.thebluealliance.com).

- **frc_lateness_tracker.html** — For field staff. Track which teams are habitually late to the field.
- **frc_match_timer.html** — For teams. Countdown to when you need to leave the pit.

End users need no API key. You hold the key once, in a Cloudflare Worker. Everyone else just opens a URL.

---

## One-time setup (~15 minutes)

### Step 1 — Get a free TBA API key

1. Sign in at [thebluealliance.com](https://www.thebluealliance.com)
2. Go to **Account → Read API Keys**
3. Click **Add New Key**, give it a description, copy the key

### Step 2 — Push this repo to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/frc-tools.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages

1. Go to your repo on GitHub → **Settings → Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose **main** branch, **/ (root)** folder → Save

Your tools will be live at:
```
https://YOUR_USERNAME.github.io/frc-tools/frc_lateness_tracker.html
https://YOUR_USERNAME.github.io/frc-tools/frc_match_timer.html
```

### Step 4 — Deploy the Cloudflare Worker

This is the proxy that holds your TBA key so users don't need one.

```bash
# Install Wrangler (Cloudflare's CLI) — one time
npm install -g wrangler

# Log in to Cloudflare (free account, no credit card needed)
wrangler login

# Deploy the worker
cd worker
wrangler deploy
```

After deploying, Wrangler prints your worker URL:
```
https://frc-tba-proxy.YOUR_SUBDOMAIN.workers.dev
```

Store your TBA key as a secret (you'll be prompted to paste it):
```bash
wrangler secret put TBA_API_KEY
```

### Step 5 — Configure the worker and HTML files

**In `worker/index.js`**, set your GitHub Pages URL:
```js
const ALLOWED_ORIGIN = 'https://YOUR_USERNAME.github.io';
```

**In both HTML files**, set your worker URL:
```js
const PROXY_URL = 'https://frc-tba-proxy.YOUR_SUBDOMAIN.workers.dev';
```

Then redeploy the worker and push the HTML changes:
```bash
cd worker && wrangler deploy
cd .. && git add -A && git commit -m "Set worker URL and origin" && git push
```

That's it. Share the GitHub Pages URLs with your team — no keys, no installs.

---

## Local development

If you want to run and test locally:

```bash
echo "TBA_API_KEY=your_key_here" > .env
node server.js
# Open http://localhost:3000
```

---

## Free tier limits

- **Cloudflare Workers free**: 100,000 requests/day — plenty for any FRC event
- **GitHub Pages**: unlimited for public repos

---

## Credits

Data provided by [The Blue Alliance](https://www.thebluealliance.com).
