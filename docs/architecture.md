# Previa Architecture Diagram

Below is the Mermaid sequence and flow diagram detailing how Previa processes stadium telemetry, runs multi-agent synthesis using a single Gemini API call, and updates the Command Center dashboard and Fan Copilot clients.

## System Data Flow

```mermaid
graph TD
    %% Define Nodes
    subgraph Frontend [Browser Frontend Layer]
        UI[Command Center Web UI]
        Copilot[Fan Copilot Simulator]
        Chart[SVG Wait Time Chart]
    end

    subgraph Backend [Python HTTP server.py]
        Server[Threading HTTP Server]
        Sim[Telemetry Simulator simulator.py]
        GeminiClient[Gemini API Client Gateway]
    end

    subgraph External [External APIs]
        Gemini[Google Gemini 3.5 Flash Engine]
    end

    %% Data connections
    UI -->|1. Request telemetry & AI synthesis| Server
    Server -->|2. Pull current step telemetry| Sim
    Server -->|3. Forward telemetry context| GeminiClient
    GeminiClient -->|4. Single-call Orchestrated Prompt| Gemini
    Gemini -->|5. Multi-agent JSON response| GeminiClient
    GeminiClient -->|6. Safe JSON parse / fallback| Server
    Server -->|7. Return combined signals & synthesis payload| UI

    %% UI routing
    UI -->|8. Sync active alerts overlay| UI
    UI -->|9. Render Gate charts & tables| Chart
    UI -->|10. Feed walking paths & chat context| Copilot
```

## AI Multi-Agent Orchestration Sequence

```mermaid
sequenceDiagram
    participant Browser as Web Browser (app.js)
    participant Server as server.py
    participant Simulator as simulator.py
    participant Gemini as Gemini API (gemini-3.5-flash)

    Browser->>Server: GET /api/signals?step=X
    Server->>Simulator: get_sensor_data(step)
    Simulator-->>Server: Return telemetry (weather, gates, transport, incidents)
    Server-->>Browser: Return JSON telemetry payload

    Browser->>Server: GET /api/synthesis?step=X
    Server->>Simulator: get_sensor_data(step)
    Simulator-->>Server: Return telemetry data
    Server->>Gemini: POST generateContent (single-call system context)
    Note over Server,Gemini: Packs telemetry data + role synthesis constraints in system instructions.
    alt API Success
        Gemini-->>Server: Return Markdown payload containing role blocks
        Server->>Server: parse_role_synthesis() (strip code fences)
    else Rate Limit (429) or Network Failure
        Server-->>Server: Fallback to mock synthesis data
    end
    Server-->>Browser: Return role synthesis details & latency JSON
    Browser->>Browser: Render 6 perspective cards + dynamic gauges
```

## Key Architecture Components

1. **Multi-Threaded Server (`server.py`)**: Utilizes `ThreadingHTTPServer` to handle simultaneous browser asset loads and API requests asynchronously, avoiding socket blocking during Gemini API calls.
2. **Telemetry Simulator (`simulator.py`)**: Models the stadium queue dynamics across a timeline, exposing sensor readings for weather conditions, gate wait times, public transit status, and safety logs.
3. **Structured Parser**: The server strips markdown delimiters from Gemini outputs to produce robust JSON objects, ensuring no raw backticks or styling codes break the frontend presentation.
4. **Fallback Mechanism**: Features a resilient fallback to mock synthesis data if the Gemini API returns rate limiting errors (429 Resource Exhausted) on free tiers, ensuring uninterrupted operations.
