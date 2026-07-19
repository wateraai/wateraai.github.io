# Water AI — Deployment Guide

## What changed
- **SEO**: `index.html` and `chat.html` now have proper title/description tags, canonical URLs, Open Graph + Twitter cards, robots directives, and JSON-LD structured data. `robots.txt` and `sitemap.xml` were added.
  - I did **not** add `ethical hacker ai` / `hacking ai` as keywords — they're unrelated to the product and keyword-stuffing like that is penalized by Google, not rewarded. The keywords used are ones that actually describe Water AI.
- **Auth**: New `login/login.html` and `login/signup.html` pages, wired to Supabase Auth (email + password). `supabase-client.js`, `supabase-config.js`, and `auth-state.js` were added to connect them and to show sign-in state in the nav.
- **No existing functionality was changed.** `chat.js` is untouched — same chat logic, same providers, same plan/demo system.

## Files in this package
```
index.html
chat.html
chat.js
styles.css
robots.txt
sitemap.xml
vercel.json
supabase-config.js       ← you edit this
supabase-client.js
auth-state.js
supabase-schema.sql       ← you run this in Supabase
login/login.html
login/signup.html
```

## 1. Required changes before deploying

### a) Connect Supabase
Your Supabase account currently has no projects, so this can't be pre-wired. To connect it:
1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard) (or use an existing one).
2. Go to **Project Settings → API**.
3. Open `supabase-config.js` and replace the two placeholder values:
   ```js
   export const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
   export const SUPABASE_ANON_KEY = "YOUR-PUBLIC-ANON-KEY";
   ```
4. In the Supabase dashboard, open **SQL Editor**, paste the contents of `supabase-schema.sql`, and run it. This creates a `profiles` table (with row-level security) that gets a row automatically whenever someone signs up.
5. In **Authentication → URL Configuration**, set your **Site URL** to your real deployed domain (e.g. `https://waterai.vercel.app` or your GitHub Pages URL), and add it to **Redirect URLs** too. This matters for email-confirmation links to work correctly.
6. By default Supabase requires email confirmation before a session is created. You can turn this off in **Authentication → Providers → Email → Confirm email** if you want instant sign-in without a confirmation step (fine for a demo; for production, leaving it on is safer).

### b) Real domain in SEO files
Replace `https://www.waterai.app` with your actual domain in:
- `index.html` (canonical, og:url, og:image, twitter:image)
- `chat.html`, `login/login.html`, `login/signup.html` (canonical tags)
- `robots.txt` and `sitemap.xml`

### c) Add real assets
- `favicon.ico` is referenced but not included — add one at the repo root (any free favicon generator works).
- `og-image.png` is referenced for social sharing previews — add a 1200×630 image at the repo root, or remove the `og:image`/`twitter:image` tags if you don't want one yet.

### d) chat.js API keys (unrelated to this task, but flagged for you)
`chat.js` still contains the placeholder `"my groq api key"` and a public demo endpoint. Nothing about this was changed, but as-is, chat won't get real AI responses until you add a working key, and any key placed directly in this file is visible to anyone who opens dev tools. For a real deployment, proxy that call through a small backend (e.g. a Vercel serverless function or Supabase Edge Function) so keys aren't exposed client-side.

## 2. Deploying

### GitHub Pages
1. Push all these files to a GitHub repo (keep the `login/` folder structure).
2. Repo → **Settings → Pages** → set source to your default branch, root folder.
3. Your site will be live at `https://<username>.github.io/<repo>/`. All links in these files are relative, so it works fine in a subfolder — just update the SEO domain values (step 1b) to match this exact URL.

### Vercel
1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Other** (static site) — no build command needed.
3. `vercel.json` is already included (adds clean URLs and basic security headers).
4. Deploy, then update the SEO domain values to your Vercel URL (or custom domain once attached).

### Supabase
Supabase isn't "deployed" here — it's your backend. Just make sure steps 1(a) above are done: project created, schema run, config filled in, and Site URL/Redirect URLs set to match wherever you deployed (GitHub Pages or Vercel).

## Summary of what you need to do
1. Create/point to a Supabase project → paste URL + anon key into `supabase-config.js`.
2. Run `supabase-schema.sql` in the Supabase SQL Editor.
3. Set Supabase Auth Site URL + Redirect URL to your deployed domain.
4. Replace `waterai.app` placeholder domain across the SEO tags, `robots.txt`, and `sitemap.xml`.
5. Add a real `favicon.ico` (and optionally `og-image.png`).
6. Add a working chat API key in `chat.js` if you want live responses (and consider moving it server-side).
7. Push to GitHub → enable Pages, or import into Vercel.
