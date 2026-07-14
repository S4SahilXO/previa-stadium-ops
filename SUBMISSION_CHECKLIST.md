# Prompt Wars — Submission Checklist (Challenge 4)

> Source: rules pasted by the builder. The linked Google Doc ("[PUB]How to Make a Submission?") could not be opened here because it requires a Google sign-in — **open it yourself in a browser and skim it once before final submission**, in case it has extra detail not repeated in the pasted instructions below.

## A. Before you touch code

- [x] Antigravity (or your chosen AI platform) downloaded and set up.
- [x] Git installed and configured (`git config --global user.name/email` done).
- [x] Active GitHub account, able to create **public** repos.
- [x] Decide the repo name now (e.g. `previa-stadium-ops`) so it's consistent everywhere: README, blog, pitch deck.

## B. Hard rules — breaking any of these risks disqualification

- [ ] **Maximum 3 submission attempts** — do not treat this casually; treat your first real push as if it might be your only shot.
- [x] **Repo size < 10 MB total.** Check regularly with `du -sh .git` and `du -sh .` — this is easy to blow past with node_modules, images, or model files committed by accident.
- [x] **Repository is public.**
- [x] **Single branch only** — never create/push a second branch, never leave the repo in a state with more than one branch visible.
- [x] Commit `.gitignore` in the very first commit covering at least: `node_modules/`, `.env*`, build output dirs (`dist/`, `.next/`, `build/`), OS junk (`.DS_Store`), any large sample media.

## C. Build process (what evaluators expect to see reflected in history)

- [x] Repo created on GitHub, set to public, before coding starts.
- [x] Repo cloned inside Antigravity.
- [ ] Solution built via prompting + coding (this master prompt + follow-ups).
- [ ] **Commit regularly, in small logical chunks** — a commit history of one giant commit at the end reads badly for "code quality/maintainability" scoring. Commit at the end of each phase at minimum, ideally more often.
- [x] All work stays in the one branch, pushed to `main` (or `master`, whichever GitHub defaults to — just be consistent).

## D. What must be in the final submission

- [ ] Public GitHub repo link.
- [ ] Complete project code inside the repo (no "ask me for the rest," nothing missing that's needed to run it).
- [ ] `README.md` containing, explicitly:
  - [ ] Chosen vertical: Challenge 4 — Smart Stadiums & Tournament Operations (FIFA World Cup 2026).
  - [ ] Approach and logic (the multi-agent-via-single-Gemini-call architecture, explained simply).
  - [ ] How the solution works (walk through the demo scenario).
  - [ ] Assumptions made (simulated data, out-of-scope items, anything not real/live).
  - [ ] Setup/run instructions a stranger could follow.
- [ ] `LEARNING_LOG.md` present (shows genuine understanding, useful if asked questions about your own code).
- [ ] Architecture diagram (image or clearly-formatted diagram in `/docs`).

## E. Evaluation focus areas — map your effort here

Per the rules, submissions are scored on:

| Area | What that actually means for this build |
|---|---|
| **Code Quality** | Consistent structure (one backend framework, one frontend framework — no mixing), readable names, no dead/commented-out code left in, no giant files doing everything. |
| **Security** | No API keys committed (`.env` in `.gitignore`, use environment variables), no obviously unsafe input handling on any endpoint that takes user input, no secrets in client-side code. |
| **Efficiency** | The single-Gemini-call orchestration (Section 4 of the master prompt) *is* your efficiency story — be ready to explain latency/cost tradeoffs. Avoid unnecessary re-renders/polling loops that would look wasteful in a code review. |
| **Testing** | Even a small amount of real testing (a few unit tests on the recommendation-parsing logic, a documented manual test pass of both themes/screens) is better than none — note it in the README. |
| **Accessibility** | Both themes must have real contrast (not just aesthetic dark mode), keyboard-navigable primary flows, alt text on meaningful images/icons, no color-only signaling of risk level (pair color with text/icon). |

Treat **Code Quality** and **Security** as the highest-leverage, most visible items a reviewer will notice in the first two minutes of opening the repo — prioritize accordingly if time runs short.

## F. Final pre-submission pass (do this the day before deadline, not the hour before)

- [ ] Fresh clone of the repo into a clean folder, run it from scratch following only your own README — fix anything that doesn't work first try.
- [ ] Confirm repo is public (log out / use incognito to view it).
- [ ] Confirm single branch.
- [ ] Confirm size under 10 MB (`git clone` fresh and check folder size, not just working directory, since `.git` history can bloat it even if current files are small).
- [ ] Re-read the linked submission doc once more directly in a browser for anything not captured above.
- [ ] Rehearse the 5–7 minute demo against the scenario runner (Section 9 of the master prompt) at least twice.
