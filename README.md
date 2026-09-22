# Gym Log — PWA draft

Three tabs: **Log** (data entry), **Summary** (progression + weekly volume charts), and **Edit** (templates + exercise catalog).
Static site — no server, no subscription. Runs entirely in the browser.

## Edit tab

- **Edit template.** Pick a template (A–E), change its label, cardio machine, and exercise list — reorder (▲▼), remove (×), or add from the dropdown. *Save template* persists it on this device and updates *Load suggestion* on the Log tab; *Reset to default* reverts.
- **Add / edit exercise.** Add a new exercise to the catalog, or tap any exercise to edit it. Each has a **primary, secondary, and tertiary muscle group** (secondary/tertiary optional), a load type, default sets, and a typical weight. Editing existing exercises lets you fill in their secondary/tertiary groups.
- Muscle-group filters on the Log tab match **any** of an exercise's three groups (e.g. Decline Press shows under Chest, Triceps, and Shoulders).
- Changes are stored on-device as overrides on top of `catalog.json`. **Export catalog.json** and commit it over `data/catalog.json` in the repo to share them across devices.
- Weekly-volume charts still credit the **primary** group only (secondary/tertiary would triple-count tonnage).

## Deploy to GitHub Pages (3 steps)

1. Create a repo (e.g. `gym-log`) and upload these files at the root:
   `index.html`, `manifest.json`, `sw.js`, `data/catalog.json`, `data/workouts.json`
2. **Settings → Pages → Source: Deploy from a branch → `main` / `root` → Save.**
3. Open `https://<user>.github.io/gym-log/` on your phone → **Add to Home Screen** (iOS: Share menu) or **Install app** (Android: ⋮ menu).

After the first load it works offline; your data is stored on the phone.

> Opening `index.html` straight from disk won't work — `fetch()` of the data files is blocked on `file://`. Use GitHub Pages, or `python3 -m http.server` locally.

## How it works

| File | Purpose |
|---|---|
| `index.html` | the whole app (UI + charts, no dependencies) |
| `data/catalog.json` | 32 exercises with muscle group, load type, last weight used + the A/B/C/D/E templates |
| `data/workouts.json` | your history so far (26 sessions) — the seed the charts start from |

**Logging.** Pick a date and a workout (A–E) → *Load suggestion* preloads that day's usual exercises → adjust. Add anything else from the filtered picker (muscle-group chips + search), or `+ Custom exercise`.

**Per-set weights.** Every set row has its own weight field — nothing assumes the weight stays the same across sets. New rows copy the previous row's weight as a convenience only.

**Three logging modes**, chosen automatically per exercise:
- `per_side` — dumbbells, shown as *kg / side* (stored as `14||14`)
- `total` — barbells/stacks, a single load
- `one_side` — e.g. Bulgarian split squat (`10||-`)
- `bodyweight` — crunches, leg raises, Nordic curls: **reps only, no weight field**; they still count as hard sets but add no tonnage
- **Cardio** is its own block (machine, time, distance, incline), one per session — not sets

**Saving / validation.** *Save workout* asks for the password `196966`. A workout is recorded **only** when the password is correct — it is then stamped with `validated: true` and a `logged_at` timestamp, written to on-device storage, and exported as JSON. Any log **without** a valid stamp is ignored: unvalidated sessions in storage are dropped on load, and *Import JSON* accepts only validated sessions (it reports how many it ignored). The seed history (`data/workouts.json`) is trusted. Note this is a workflow gate, not encryption — the password sits in the page source; encrypting the data is a separate optional step.

**Updating the charts.** Instant — the Summary tab reads on-device storage. No rebuild, no redeploy.

**Syncing / backup.** Commit the exported `workouts-YYYY-MM-DD.json` over `data/workouts.json` in the repo; other devices pick it up on next load. *Import JSON* restores a backup onto a device.

## Security — read this

The password lives in the page source (`const PASSWORD`). It stops casual snooping, **it is not real security**, and on a free GitHub plan the Pages site is publicly reachable even from a private repo. If you want the *data* genuinely protected, the next step is encrypting `workouts.json` with that password (Web Crypto AES-GCM) so a finder downloads something unreadable.

## Schema

Unchanged from the existing dataset, so `sets.csv` / `exercises.csv` tooling still applies. Sessions gain one field: `logged_at`. Weeks are derived from the date (Monday start), so `[U]`/extra days fall into the right week automatically.
