# Previa — Learning Log

## [Phase 0] — Project Setup and Discipline Alignment — 2026-07-14

### What we built
We initialized the project structure by establishing a local Git repository, configuring a basic `.gitignore` (which keeps the repo lightweight by ignoring dependency folders like `node_modules` and secret files), and writing the starting `README.md` outline. We also integrated the Ponytail coding ruleset (`AGENTS.md`), which is a discipline guideline forcing us to write minimal, non-overengineered code by checking standard library or existing functions first. We planned the project directories, choosing a monorepo setup containing a React frontend and a Node/Express backend. Finally, we created and executed [test-gemini.py](file:///g:/My%20Drive/Sahil_Files/challenge%204/test-gemini.py) to verify the Gemini API connection.

### Why we built it this way
We chose a local Git setup to facilitate small, frequent, and structured commits as required by prompt-driven workflow best practices. We chose to separate the project into `/frontend` (React + Vite) and `/backend` (Node/Express) folders so that the responsibilities of the visual client interface and the server reasoning API remain distinct. We decided to resolve the styling conflict in favor of Tailwind CSS to match the master prompt's strict styling requirements, while keeping the stack unified with Node/Express to write end-to-end JavaScript/TypeScript. We wrote the test script in Python without external dependencies using `urllib` to adhere to Ponytail's rule of preferring native standard libraries over extra packages. We used the newer `gemini-3.5-flash` model, as `gemini-2.5-flash` is no longer available for new API keys.

### Key code/concepts to understand
- [AGENTS.md](file:///g:/My%20Drive/Sahil_Files/challenge%204/AGENTS.md) — ruleset for maintaining the "lazy senior dev" coding discipline.
- [test-gemini.py](file:///g:/My%20Drive/Sahil_Files/challenge%204/test-gemini.py) — dependency-free Python script to verify Gemini API connection.
- [.gitignore](file:///g:/My%20Drive/Sahil_Files/challenge%204/.gitignore) — list of files and patterns to prevent committing to git history.
- [README.md](file:///g:/My%20Drive/Sahil_Files/challenge%204/README.md) — initial skeleton documentation describing Previa's problem space and virtual multi-agent architecture.
- Concept: Git repository initialization — setting up a local control system to track changes without immediately pushing them to remote platforms.
- Concept: REST API calling via Standard Library — using built-in languages tools (like `urllib` in Python) to communicate with APIs without downloading external dependency helper SDKs.

### Try it yourself
1. Inspect [AGENTS.md](file:///g:/My%20Drive/Sahil_Files/challenge%204/AGENTS.md) and note the 7 rungs of the coding ladder.
2. Run `python test-gemini.py` in your terminal to see the API execute. Try changing the prompt string inside the script to see how Gemini responds.

### Prompt and Response Log
- **Model:** `gemini-3.5-flash` (API version `v1beta`)
- **Prompt:** `Say hello in exactly 3 words.`
- **Response:** `Hello, my friend.`

### Open questions / what's next
In Phase 1, we will define our simulated dataset (stadium crowd flow, gate counts, weather feeds, transportation ETAs) and create a mock version of the operations dashboard interface to establish our frontend design language.
