# Water AI — Deployment Guide

## What changed in this pass
- **Domain**: every SEO/canonical link (`index.html`, `chat.html`, `robots.txt`, `sitemap.xml`) now points at `https://waterai.github.io` instead of the old `waterai.app` placeholder.
- **Login/signup pages rebuilt**: `login/login.html` and `login/signup.html` are new files (they were referenced by the nav but weren't in the upload), wired to Supabase Auth (`signInWithPassword` / `signUp`), styled with the existing `.auth-page`/`.auth-card` CSS. Also fixed a bug where the homepage's "Sign In" button linked to the signup page and vice versa.
- **Guest chat + login reminder**: `chat.html` no longer redirects signed-out visitors away. Anyone can chat as a guest; if they aren't signed in, a dismissible "Sign In / Sign Up / Continue as guest" popup appears every 2 minutes (`auth-state.js`).
- **Email, not username**: the sidebar footer now shows the signed-in account's email (or "Guest") at all times, including on small phones where the top-nav chip has to hide to avoid overflow.
- **Writing/Code gated to Pro**: the mode dropdown now visibly locks 🔒 the Writing and Code options for free users; clicking a locked option opens the upgrade modal instead of silently switching modes.
- **Mobile chat scrolling**: `chat.html` uses `100dvh` (with a fallback) so the layout resizes correctly when the on-screen keyboard opens, and `chat.js` now re-scrolls to the latest message on input focus, keyboard open/close (`visualViewport` resize), and orientation change.
- **Responsive buttons**: nav buttons and the email chip no longer disappear on mobile (they used to be hidden below 720px) — they now wrap/shrink instead. Hero buttons, modal action buttons, and the nav bar itself now wrap gracefully on narrow phones instead of overflowing or clipping.
- **No other functionality was changed** — chat providers, the demo/PIN plan system, and export/shortcuts all work as before.

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
`supabase-config.js` already has a project URL and anon key filled in — if that's your project, you can skip straight to step 4 (running the schema) and step 5 (Site URL). If you want to point this at a different project instead:
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

### b) Domain in SEO files
Every canonical/OG/sitemap URL now points at `https://waterai.github.io`. If you deploy anywhere else (a different GitHub username, Vercel, a custom domain), replace `waterai.github.io` with your real domain in:
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
2. If the repo is named exactly `<your-username>.github.io` (a GitHub **user site**), it publishes straight to `https://<your-username>.github.io/` with no subpath — that's what the SEO tags already assume. If instead you use a normal project repo, it publishes to `https://<username>.github.io/<repo>/`; since all links here are relative it'll still work, just update the SEO domain values (step 1b) to match that exact URL.
3. Repo → **Settings → Pages** → set source to your default branch, root folder.

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
4. Replace `waterai.github.io` placeholder domain across the SEO tags, `robots.txt`, and `sitemap.xml`.
5. Add a real `favicon.ico` (and optionally `og-image.png`).
6. Add a working chat API key in `chat.js` if you want live responses (and consider moving it server-side).
7. Push to GitHub → enable Pages, or import into Vercel.
