# Placement Command Center

A personal, offline, single-user placement-prep dashboard. Pure HTML/CSS/JavaScript,
no build step, no server, no accounts. All your data stays in your browser's
`localStorage` — nothing is sent anywhere.

Deadline focus: **December 31, 2026**. Three sections: **Campus Placements**,
**Off-Campus**, **Government Exams** — plus a daily **Today** checklist that
adapts to how much time you actually have, and a **Dashboard** with readiness
scores, weak-area detection, and weekly/monthly review.

## Run it locally

No installation needed. Just open `index.html` in any browser (double-click it,
or right-click → Open With → your browser).

## Put it on GitHub Pages

1. Create a new repository on GitHub (e.g. `placement-command-center`).
2. Upload all five files from this folder — `index.html`, `style.css`,
   `script.js`, `data.js`, `README.md` — to the repository (drag-and-drop on
   the GitHub web UI works fine, or `git add . && git commit -m "Initial commit" && git push`).
3. Commit the files to the `main` branch.
4. In the repository, go to **Settings → Pages**.
5. Under "Build and deployment", set **Source** to **Deploy from a branch**,
   branch **main**, folder **/(root)**. Click **Save**.
6. GitHub will build the site and give you a URL like
   `https://your-username.github.io/placement-command-center/`. Open it —
   your dashboard is live.
7. Bookmark that URL. Every visit loads the same static files, and your data
   persists in that browser via `localStorage`.

No `npm install`, no build command, no backend, no API keys.

## Your data

- Everything you enter is saved automatically to `localStorage` in your
  browser, tied to the site's URL/origin.
- **Different browser or device = different data.** `localStorage` does not
  sync across browsers or machines, and GitHub Pages does not store anything
  on your behalf — it only serves the static files.
- **Back up regularly.** Go to **Profile & Data → Export data (JSON)** to
  download a full backup. Use **Import data** to restore it (in the same
  browser or a new one). This is your only portability/sync mechanism.
- Clearing your browser's site data/cache for this URL will erase everything
  that isn't backed up. Export before doing any browser cleanup.
- **Reset all data** permanently wipes everything in this browser. There is
  no undo — export first if unsure.

## What's inside

- **Today** — a checklist that changes based on the time you select (Full day
  / Busy day / Emergency / Minimum), with planned vs. actual minutes, status,
  and notes per task. Checkbox state persists across refreshes.
- **Dashboard** — an overall readiness score built from *effort actually
  logged* (independent solves, spoken answers, verified applications — not
  just content viewed), a weak-area detector, a weekly review card, and a
  monthly summary table for Sep–Dec 2026.
- **Campus Placements** — company tracker, DSA/Aptitude/CS/Java/SQL trackers,
  resume & HR question banks, project-interview prep, technical interview
  question bank, OA/mock-test log, mock interview log, and an English/
  communication log.
- **Off-Campus** — application tracker, job-site quick links (verify every
  listing on the official company careers page before applying), a
  hiring-status watchlist (labeled clearly as a watchlist, not a hiring
  claim), a referral/networking tracker, and a permanent application-safety
  reminder card.
- **Government Exams** — exam tracker (SSC, Banking, UPSC, Railways, ISRO,
  DRDO, PSUs, GATE, and more), official government links, and a "what to
  study" reference per category. Every date field lets you mark it
  Tentative / Official / Expected and record when you last verified it —
  government dates change, so always re-check the official notification.
- **Profile & Data** — your profile, a daily log, global search across
  companies/applications/exams/DSA/questions/projects, and export/import/reset.

## Notes

- Nothing here promises or predicts a job outcome. Readiness scores measure
  logged preparation only.
- Government exam dates preloaded in the tracker are reference placeholders —
  they are **not** verified live dates. Always check the official website
  before relying on any date.
- The off-campus company watchlist is exactly that — a watchlist. It is not a
  claim that any of those companies are currently hiring.
