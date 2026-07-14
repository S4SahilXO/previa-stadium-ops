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
In the next step, we will wire and test the Gemini API connection with a simple script to verify our credentials before setting up the mock data pipeline in Phase 1.

---

## [Phase 1] — Simulated Dataset and Operations Dashboard Mock — 2026-07-14

### What we built
We built a simulated stadium telemetry dataset representing various real-time sensor signals, including wait times, flow rates, density metrics for six entry gates, weather stats, public transit intervals, bus delay schedules, parking lot fill rates, and medical or security logs. We wrote a lightweight, single-threaded Python HTTP server (`server.py`) using only standard libraries to serve this telemetry via REST endpoints and host our frontend static files. Finally, we created an interactive operations dashboard mockup in HTML5, CSS, and Vanilla JavaScript with a fully functional light and dark theme toggler, a tab navigation structure, and a scenario panel to cycle through the five predefined demo stages.

### Why we built it this way
We opted to serve the web application and REST endpoints from a single Python file using `http.server` because it completely eliminates node packages and framework dependencies, aligning perfectly with the Ponytail YAGNI (You Aren't Gonna Need It) rule. Serving the Tailwind CSS framework via a public CDN allowed us to implement modern, high-density layouts immediately without adding complex bundlers or build steps. We decided to store the simulated sensor data inside a modular module (`simulator.py`) to easily handle state changes representing compounding operational disasters for the judging demo scenario.

### Key code/concepts to understand
- [simulator.py](file:///g:/My%20Drive/Sahil_Files/challenge%204/simulator.py) — computes gate, weather, transport, and incident data matching the step (0-4) of the demo.
- [server.py](file:///g:/My%20Drive/Sahil_Files/challenge%204/server.py) — standard-library web server delivering files from `public/` and handling query params.
- [public/index.html](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/index.html) — layout shell including signals feed, AI analysis summaries, recommendations, and detail panel.
- [public/app.js](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/app.js) — handles tab transitions, theme persistence via local storage, and async fetching of sensors.
- Concept: Single-threaded blocking server — a web server that handles requests in a sequential queue, which will temporarily delay asset load times if an endpoint runs a long-running task.

### Try it yourself
Open the Previa dashboard in your browser and switch to the "Fan Copilot" tab. Cycle through the scenario controller buttons at the top of the screen (0 to 4) and observe how the fan advisory card changes from a green "Operations Normal" message to an amber alert directing fans away from congested areas.

---

## [Phase 2] — Real AI Pipeline and Orchestrated Synthesis — 2026-07-14

### What we built
We wired the actual virtual multi-perspective AI reasoning pipeline by replacing our mock `/api/synthesis` endpoint with a live call to the Gemini API (`gemini-3.5-flash`). We designed a structured prompt that takes the raw sensor data and instructs Gemini to act as a panel of six specialist perspectives—Crowd, Transport, Security, Medical, Weather, and Operations—synthesize a situation summary, and generate ranked, confidence-scored recommended actions returned as a clean JSON payload. We added robust string parsing to strip markdown fences, implemented an automatic mock fallback class to handle resource limits or API errors gracefully, and upgraded the Python backend to a multi-threaded `ThreadingHTTPServer` to process assets and API requests concurrently.

### Why we built it this way
We chose to implement the Gemini API request using Python's built-in `urllib` module rather than the Google Generative AI SDK to keep the project completely dependency-free and under the 10 MB limit. We upgraded the server to a multi-threaded architecture because the live Gemini API call is a long-running HTTPS task; a single-threaded server would block the browser from downloading script assets or other signals concurrently, resulting in connection timeouts. We built the mock fallback wrapper so that even if the client exceeds the Free Tier API rate limit (5 requests per minute), the dashboard continues to display realistic data instead of crashing.

### Key code/concepts to understand
- [server.py](file:///g:/My%20Drive/Sahil_Files/challenge%204/server.py) (`get_real_synthesis`) — aggregates current signals, calls Gemini, parses markdown JSON wrapper, measures latency, and handles exception fallbacks.
- [public/app.js](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/app.js) (`renderSynthesis`) — updated to display the AI response latency and execution mode (Active vs. Fallback) next to the subtitle.
- Concept: Multi-threaded HTTP server — a web server that spawns a new thread for each connection, allowing slow API operations and fast static files to be served in parallel.
- Concept: API Rate Limiting (HTTP 429) — standard restriction on free-tier APIs limiting requests per minute, which requires client applications to implement robust fallbacks.

### Try it yourself
Look at the local terminal output or the developer console in your browser when you switch steps. You will notice the measured latency (e.g. `Latency: 2.15s (Active)` or `Latency: 0.00s (Fallback)`). Try sending rapid requests (more than 5 per minute) to deliberately trigger the HTTP 429 error and see the server seamlessly transition to Fallback mode to preserve operations.

### Prompt and Response Log
- **Model:** `gemini-3.5-flash` (API version `v1beta`)
- **Prompt:**
```
You are the central reasoning orchestrator for Previa, an operational decision-support platform for FIFA World Cup 2026 stadium operations.
You receive raw sensor signals from the stadium and must reason through the perspectives of six specialist operational agents:
1. Crowd Agent (Gate queue wait times, flow rates, density)
2. Transport Agent (Metro intervals, bus delays, parking occupancy)
3. Security Agent (Perimeter safety, queue safety)
4. Medical Agent (Heat stroke/exhaustion, emergency requests)
5. Weather Agent (Rain rate, wind speed, visibility)
6. Operations Agent (Scanner counts, staff workload)

Analyze these raw signals carefully:
[JSON sensor payload]

You must produce a JSON payload strictly matching the following schema. Return ONLY a single raw JSON block. Do not include markdown code fences (```json or ```). Do not include any leading or trailing commentary.

JSON Schema:
{
  "situation_summary": "1-sentence plain language summary of the overall situation.",
  "perspectives": [
    {
      "role": "crowd",
      "assessment": "1-2 sentence assessment of crowd issues.",
      "risk_level": "low|medium|high|critical"
    },
    ...
  ],
  "recommended_actions": [
    {
      "action": "Description of action 1",
      "rank": 1,
      "confidence": 0.0 to 1.0,
      "expected_impact": "Plain-language expected outcome.",
      "reasoning": "Plain-language explanation of why this action is chosen."
    }
  ],
  "overall_confidence": 0.0 to 1.0
}
```

### Open questions / what's next
In the next step, we will wire and test the Gemini API connection with a simple script to verify our credentials before setting up the mock data pipeline in Phase 1.

---

## [Phase 3] — Command Center UI Polishing and Design System Refinement — 2026-07-14

### What we built
We refined the visual styling of the Command Center interface to match a premium operational console aesthetic (inspired by Stripe, Linear, and Vercel). We overhauled the status badges in the Gate Wait Times list to use thin colored borders and soft transparent background fills. We redesigned the six Agent Perspectives risk cards to feature color-dot status lights that correspond directly to the risk level. Finally, we removed all decorative emojis from the Fan Copilot headings and warning messages to maintain a professional, clean tone.

### Why we built it this way
We refined the UI this way to satisfy the strict visual requirements of Section 6 of the master build prompt, which explicitly forbids traditional hackathon dashboard styling (such as gradients, stock emojis, and mascots). By using thin color-matched borders instead of heavy color blocks, we maintained a high information density while keeping the interface calm and readable. We added physical color-dot status lights to risk badges to ensure they are accessible and do not rely on color alone to communicate information.

### Key code/concepts to understand
- [public/app.js](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/app.js) (`getRiskStyle`) — updated with high-contrast, premium border-and-background styling rules.
- [public/app.js](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/app.js) (`renderSynthesis`) — overhauled the HTML templates for the six perspectives cards to inject color-dot status lights.
- [public/app.js](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/app.js) (`renderCopilot`) — stripped of emojis and updated with sleek operational layouts.
- Concept: Functional color semantics — applying color selectively for information hierarchy (such as risk levels) rather than aesthetic decoration.

### Try it yourself
Open the dashboard and toggle between Light and Dark modes. Notice the clean borders on cards and badges, and verify that all text blocks maintain clear contrast and read smoothly in both themes.

### Open questions / what's next
In the next step, we will wire and test the Gemini API connection with a simple script to verify our credentials before setting up the mock data pipeline in Phase 1.

---

## [Phase 4] — Predictive Crowd Module and Dynamic SVG Charts — 2026-07-14

### What we built
We built a predictive timeline state-projection view in the Crowd Predictor workspace, allowing operators to toggle between the "Current State", "+15 Min Projection", and "+30 Min Projection". We updated `simulator.py` to calculate these projections on-the-fly based on subsequent scenario steps, packaging them inside a clean `predictions` nested object. Finally, we wrote a dependency-free dynamic SVG wait-time trajectory line chart for Gate 5 that draws axes, dashed timeline separators, colored markers, gradient fills, and value labels in vanilla Javascript, updating instantly as steps and projection levels change.

### Why we built it this way
We opted to generate projections by recursively calling the simulation logic for subsequent scenario steps because it matches the compounding progression of time and ensures predictions are logically consistent. We wrote the trend chart in pure SVG using vanilla JavaScript rather than pulling in external libraries (such as Chart.js or D3) to maintain a zero-dependency build structure and remain under the 10 MB limits. The SVG chart performs exceptionally well, renders instantly on both themes, and supports high information density without unnecessary browser load times.

### Key code/concepts to understand
- [simulator.py](file:///g:/My%20Drive/Sahil_Files/challenge%204/simulator.py) (`get_sensor_data`) — updated to package projected telemetry structures.
- [public/index.html](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/index.html) — contains container hooks for the timeline selectors and the dynamic trend chart.
- [public/app.js](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/app.js) (`renderPredictiveChart`) — computes scaling offsets, maps wait times to Y-coords, X-coords, and compiles the SVG elements string.
- Concept: SVG Line Plotting — using scalable vector graphics tags (`<path>`, `<circle>`, `<text>`) to draw data visualizations directly in HTML markup without drawing libraries.

### Try it yourself
Navigate to the "Crowd Predictor" tab and toggle between the projection buttons. Watch the stadium gate grid update dynamically, and observe the trajectory chart redraw Gate 5's line as you cycle the scenario step inputs.

### Open questions / what's next
In the next step, we will wire and test the Gemini API connection with a simple script to verify our credentials before setting up the mock data pipeline in Phase 1.

---

## [Phase 5] — Fan Copilot Mobile Simulator and SVG Route Maps — 2026-07-14

### What we built
We built a physical mobile phone simulator preview widget (featuring a curved iPhone-like border, dynamic island notch, virtual home indicator bar, live clock, and status signal/wifi/battery icons) inside the Fan Copilot tab workspace. We updated the rendering code to dynamically populate the mobile screen with tailored status alert cards, transit connection grids, and walking diversion maps built entirely from animated, inline SVGs. Finally, we added keyframe path animations in `public/styles.css` to draw fluid walking paths.

### Why we built it this way
We opted to wrap the Fan Copilot inside a realistic mobile device shell to give operators a visual representation of how our synthesized AI decisions directly translate to advice for stadium visitors. We built the walking diversion map in SVG and animated it using native CSS animations (`animate-dash-flow`) to keep the interface highly interactive without loading external layout packages or heavy asset images, aligning with the Ponytail rule of deleting dependencies and boilerplates.

### Key code/concepts to understand
- [public/index.html](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/index.html) — wraps the scrollable copilot container in a multi-layered phone shell layout.
- [public/app.js](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/app.js) (`renderCopilot`) — updates alert text, connection details, and maps paths inside the inline SVG map dynamically.
- [public/styles.css](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/styles.css) — contains the `@keyframes dash-flow` rules to animate paths.
- Concept: Keyframe Path Animation — manipulating the SVG `stroke-dashoffset` property over time using CSS animations to simulate walking or flow directions.

### Try it yourself
Open the "Fan Copilot" tab. Note the live digital clock updating to match your device time. Cycle steps: on Step 0 (Clear) the animated walk arrow directs traffic straight into Gate 5; on Step 3 (Surge) the route maps redraws showing a congested red cross on Gate 5 and a blue diversion path to Gate 6.

### Open questions / what's next
In the next step, we will wire and test the Gemini API connection with a simple script to verify our credentials before setting up the mock data pipeline in Phase 1.

---

## [Phase 6] — Incident Logging and Severity Overrides — 2026-07-14

### What we built
We built a dispatcher control room layout inside a dedicated 4th tab workspace: **Incident Logs**. It contains a high-density, interactive data grid showing incident IDs, local timestamps, severities, locations, and detailed descriptions. We implemented action controls on each row (Acknowledge, Resolve, Escalate) which modify the status of incidents dynamically. We added a floating, top-sliding live alert overlay notification banner that triggers automatically when High/Critical incidents are unacknowledged, and built an inline modal overlay form to let operators manually log and dispatch custom events.

### Why we built it this way
We opted to manage the incidents log entirely in client-side state arrays initialized from simulator values to avoid complex database write routes on our zero-dependency Python server. We wired the signals panel sidebar to read from this dynamic client-side array rather than the static server response so that overrides (such as clicking "Resolve") immediately reflect across the entire user interface. Using CSS transitions for the overlay banner slide-down triggers allowed us to create crisp hardware console alerts without loading large alert overlay frameworks.

### Key code/concepts to understand
- [public/index.html](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/index.html) — contains the tab button, the dispatch logs grid structure, the manual incident log dialog form, and the top-floating overlay banner.
- [public/app.js](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/app.js) (`renderIncidentsLog`) — renders the table rows and attaches click event handlers to invoke local overrides.
- [public/app.js](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/app.js) (`checkIncidentAlertOverlay`) — evaluates unacknowledged active severities to trigger slide-down banner animations.
- Concept: Client-side override state — keeping track of system overrides in local client arrays to enable immediate updates across separate views without blocking database roundtrips.

### Try it yourself
Switch to Step 4 to trigger the medical incident. Click "Dispatch" on the top-floating banner to redirect to the Incident Logs tab. Click "Resolve" next to the slip-and-fall row and notice the left-hand sidebar update to green "0 Alert(s)" immediately.

### Open questions / what's next
In the next step, we will wire and test the Gemini API connection with a simple script to verify our credentials before setting up the mock data pipeline in Phase 1.

---

## [Phase 7] — Fan Copilot Chat Integration — 2026-07-14

### What we built
We built an interactive, telemetry-aware mock chat workspace inside the mobile emulator frame. Fans can switch between the "Advisory" viewport and the "Live Assistant" chatbot. We implemented a message log display, suggested question quick action triggers, input submits, typing indicators with animation pulses, and dynamic response logic that extracts current queue times, weather warnings, and transport schedules to tailor answers.

### Why we built it this way
We wanted to provide a seamless mobile experience inside the physical iPhone shell mockup. Since the fan copilot is client-facing telemetry, keeping the state local in a `copilotMessages` array avoids server roundtrips and handles instant routing changes. Incorporating suggesting prompt buttons makes it easy for fans to experience real-time responses to critical events without having to type the query out.

### Key code/concepts to understand
- [public/app.js](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/app.js) (`renderCopilot`) — manages the toggle states and builds the bubble container layouts dynamically.
- [public/app.js](file:///g:/My%20Drive/Sahil_Files/challenge%204/public/app.js) (`calculateCopilotResponse`) — evaluates string keywords and retrieves active queue values to answer questions.
- Concept: Interactive mock latencies — using `setTimeout` triggers inside standard event loops to model network thinking latency, enhancing realism.

### Try it yourself
Open the Fan Copilot tab, select Live Assistant, and click "How do I bypass the Gate 5 queue?". Observe the pulsing dots and the dynamic answer. Switch to Step 3, re-ask, and confirm it recommends Gate 6.

### Open questions / what's next
In Phase 8, we will perform a full compliance and file sizing verification check to make sure the project builds and is ready for direct submission.
