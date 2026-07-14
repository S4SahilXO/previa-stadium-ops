import os
import json
import http.server
import socketserver
import time
import urllib.request
import urllib.error
from urllib.parse import urlparse, parse_qs
import simulator

# Read API key from environment or local .env file
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    try:
        env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8-sig") as f:
                for line in f:
                    if "GEMINI_API_KEY=" in line:
                        GEMINI_API_KEY = line.split("GEMINI_API_KEY=", 1)[1].strip()
                        break
    except Exception as e:
        print(f"Error loading .env file: {e}")

if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment or .env. AI Pipeline will use fallback mocks.")

def call_gemini_api(prompt):
    """
    Calls the Gemini API (gemini-3.5-flash) using standard urllib library.
    """
    if not GEMINI_API_KEY:
        raise ValueError("API key not configured")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }]
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    req = urllib.request.Request(
        url, 
        data=json.dumps(payload).encode("utf-8"), 
        headers=headers, 
        method="POST"
    )
    
    # 10 second timeout for response safety
    with urllib.request.urlopen(req, timeout=10) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        try:
            return res_data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as e:
            raise ValueError(f"Unexpected API response structure: {res_data}") from e

def extract_json_payload(response_text):
    """
    Strips markdown code fences and returns parsed JSON content.
    """
    text = response_text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text.strip())

class PreviaHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Base directory to serve files from is /public
        public_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public')
        super().__init__(*args, directory=public_dir, **kwargs)

    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query = parse_qs(parsed_path.query)
        
        if path == '/api/signals':
            # Extract step from query parameters
            step = int(query.get('step', [0])[0])
            data = simulator.get_sensor_data(step)
            self.send_json_response(data)
            
        elif path == '/api/synthesis':
            # Extract step from query parameters
            step = int(query.get('step', [0])[0])
            data = self.get_real_synthesis(step)
            self.send_json_response(data)
            
        else:
            # Fallback to serving static files from public/
            super().do_GET()

    def send_json_response(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        # CORS headers for development flexibility
        self.send_header('Access-Control-Allow-Origin', '*')
        json_bytes = json.dumps(data).encode('utf-8')
        self.send_header('Content-Length', str(len(json_bytes)))
        self.end_headers()
        self.wfile.write(json_bytes)

    def get_real_synthesis(self, step):
        """
        Combines current sensor signals into a single prompt, requests
        virtual multi-agent synthesis from Gemini, measures latency,
        and falls back to mock synthesis on failure.
        """
        sensor_data = simulator.get_sensor_data(step)
        
        prompt = f"""You are the central reasoning orchestrator for Previa, an operational decision-support platform for FIFA World Cup 2026 stadium operations.
You receive raw sensor signals from the stadium and must reason through the perspectives of six specialist operational agents:
1. Crowd Agent (Gate queue wait times, flow rates, density)
2. Transport Agent (Metro intervals, bus delays, parking occupancy)
3. Security Agent (Perimeter safety, queue safety)
4. Medical Agent (Heat stroke/exhaustion, emergency requests)
5. Weather Agent (Rain rate, wind speed, visibility)
6. Operations Agent (Scanner counts, staff workload)

Analyze these raw signals carefully:
{json.dumps(sensor_data, indent=2)}

You must produce a JSON payload strictly matching the following schema. Return ONLY a single raw JSON block. Do not include markdown code fences (```json or ```). Do not include any leading or trailing commentary.

JSON Schema:
{{
  "situation_summary": "1-sentence plain language summary of the overall situation.",
  "perspectives": [
    {{
      "role": "crowd",
      "assessment": "1-2 sentence assessment of crowd issues.",
      "risk_level": "low|medium|high|critical"
    }},
    {{
      "role": "transport",
      "assessment": "1-2 sentence assessment of transport issues.",
      "risk_level": "low|medium|high|critical"
    }},
    {{
      "role": "security",
      "assessment": "1-2 sentence assessment of security issues.",
      "risk_level": "low|medium|high|critical"
    }},
    {{
      "role": "medical",
      "assessment": "1-2 sentence assessment of medical issues.",
      "risk_level": "low|medium|high|critical"
    }},
    {{
      "role": "weather",
      "assessment": "1-2 sentence assessment of weather conditions.",
      "risk_level": "low|medium|high|critical"
    }},
    {{
      "role": "operations",
      "assessment": "1-2 sentence assessment of scanner/staff issues.",
      "risk_level": "low|medium|high|critical"
    }}
  ],
  "recommended_actions": [
    {{
      "action": "Description of action 1 (mandatory action if risk levels are high/critical, otherwise baseline action).",
      "rank": 1,
      "confidence": 0.0 to 1.0 (float reflecting probability of success/relevance),
      "expected_impact": "Plain-language expected outcome.",
      "reasoning": "Plain-language explanation of why this action is chosen."
    }}
  ],
  "overall_confidence": 0.0 to 1.0 (float representing confidence in overall system assessment)
}}
"""
        start_time = time.time()
        try:
            response_text = call_gemini_api(prompt)
            data = extract_json_payload(response_text)
            latency_ms = int((time.time() - start_time) * 1000)
            data["latency_ms"] = latency_ms
            data["ai_mode"] = "active"
            print(f"Gemini API call succeeded in {latency_ms}ms")
            return data
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            print(f"Gemini API call failed or timed out: {e}. Falling back to mock synthesis.")
            data = self.get_mock_synthesis(step)
            data["latency_ms"] = latency_ms
            data["ai_mode"] = "fallback"
            return data

    def get_mock_synthesis(self, step):
        """
        Mocked synthesis payload matching the contract for Phase 1.
        Returns synthesized multi-agent assessments tailored to the scenario step.
        """
        if step == 0:
            return {
                "situation_summary": "All operations normal at Lusail Stadium. All gates flowing smoothly.",
                "perspectives": [
                    {"role": "crowd", "assessment": "Queues flowing smoothly; max wait time is 10 mins.", "risk_level": "low"},
                    {"role": "transport", "assessment": "Metro arriving on time; parking lot at 65% capacity.", "risk_level": "low"},
                    {"role": "security", "assessment": "Perimeter is secure. No incidents reported.", "risk_level": "low"},
                    {"role": "medical", "assessment": "No medical incidents reported.", "risk_level": "low"},
                    {"role": "weather", "assessment": "Clear skies, mild temperature, low wind.", "risk_level": "low"},
                    {"role": "operations", "assessment": "All scanners online; staff fully deployed.", "risk_level": "low"}
                ],
                "recommended_actions": [
                    {
                        "action": "Maintain baseline operations.",
                        "rank": 1,
                        "confidence": 0.98,
                        "expected_impact": "Stabilizes entry flow at 100% capacity.",
                        "reasoning": "Signals indicate optimal flow conditions across all gates."
                    }
                ],
                "overall_confidence": 0.98
            }
        elif step == 1:
            return {
                "situation_summary": "Heavy rain has started. Operation efficiency slightly degraded due to wet concourses.",
                "perspectives": [
                    {"role": "crowd", "assessment": "Slight slowdown at ticket checkpoints due to umbrella deployment.", "risk_level": "low"},
                    {"role": "transport", "assessment": "Metro running normally; surface buses seeing light traffic delays.", "risk_level": "low"},
                    {"role": "security", "assessment": "Extra security staff monitoring concourse exit slopes for slick spots.", "risk_level": "medium"},
                    {"role": "medical", "assessment": "No active incidents, but heat stress concern has dropped.", "risk_level": "low"},
                    {"role": "weather", "assessment": "Heavy rain (15mm/hr) causing low visibility and wind gusts.", "risk_level": "high"},
                    {"role": "operations", "assessment": "Outdoor ticket readers covered; operation continuing normally.", "risk_level": "medium"}
                ],
                "recommended_actions": [
                    {
                        "action": "Deploy wet-floor caution signage in all open concourses.",
                        "rank": 1,
                        "confidence": 0.90,
                        "expected_impact": "Reduces risk of slip and fall incidents by 40%.",
                        "reasoning": "Heavy rain is causing slick surfaces near gate entrances."
                    },
                    {
                        "action": "Activate perimeter terminal bus delay notifications.",
                        "rank": 2,
                        "confidence": 0.85,
                        "expected_impact": "Manages fan expectations and reduces platform boarding congestion.",
                        "reasoning": "Bus arrivals are delayed 12 minutes due to weather conditions."
                    }
                ],
                "overall_confidence": 0.88
            }
        elif step == 2:
            return {
                "situation_summary": "Rain continues. Concurrent bus arrivals have caused a transport volume surge at Gate 5.",
                "perspectives": [
                    {"role": "crowd", "assessment": "Gate 5 queue wait times rising rapidly due to high inflow rate.", "risk_level": "medium"},
                    {"role": "transport", "assessment": "Bus arrivals delayed. Parking lots at 82% capacity.", "risk_level": "medium"},
                    {"role": "security", "assessment": "Security managing queues at Gate 5; crowds remain orderly.", "risk_level": "medium"},
                    {"role": "medical", "assessment": "No active medical calls; teams on standby near transport hubs.", "risk_level": "low"},
                    {"role": "weather", "assessment": "Heavy rain continues. Concourses are wet.", "risk_level": "high"},
                    {"role": "operations", "assessment": "Ticket scanners at Gate 5 under heavy load but functioning.", "risk_level": "medium"}
                ],
                "recommended_actions": [
                    {
                        "action": "Prepare diversion staff at Gate 5 entrance plaza.",
                        "rank": 1,
                        "confidence": 0.88,
                        "expected_impact": "Ready to re-route overflow to adjacent Gate 6 if queue grows.",
                        "reasoning": "Wait times at Gate 5 are nearing our 20-minute operational threshold."
                    },
                    {
                        "action": "Deploy wet-floor caution signs and clean concourse surfaces.",
                        "rank": 2,
                        "confidence": 0.85,
                        "expected_impact": "Minimizes slip hazard under continuous rain conditions.",
                        "reasoning": "Puddles forming near Gate 5 ticket scanning area."
                    }
                ],
                "overall_confidence": 0.86
            }
        elif step == 3:
            return {
                "situation_summary": "Gate 5 is critically overloaded with wait times exceeding 45 minutes, exacerbated by rain bottleneck.",
                "perspectives": [
                    {"role": "crowd", "assessment": "Gate 5 queue bottlenecked; wait times at 48 mins. Density is high.", "risk_level": "critical"},
                    {"role": "transport", "assessment": "Metro arriving on schedule. High pedestrian load towards Gate 5.", "risk_level": "medium"},
                    {"role": "security", "assessment": "Crowd barriers at Gate 5 under stress. Extra guards deployed.", "risk_level": "high"},
                    {"role": "medical", "assessment": "Standby medical team monitoring queue lines for heat/crowd distress.", "risk_level": "medium"},
                    {"role": "weather", "assessment": "Heavy rain continues. Wind gusts up to 30km/h.", "risk_level": "high"},
                    {"role": "operations", "assessment": "Ticket scanners at Gate 5 slowed by weather interference.", "risk_level": "high"}
                ],
                "recommended_actions": [
                    {
                        "action": "Divert incoming pedestrian flows from Gate 5 to Gate 6.",
                        "rank": 1,
                        "confidence": 0.95,
                        "expected_impact": "Reduces Gate 5 inflow by 50%, bringing wait times down in 8 mins.",
                        "reasoning": "Gate 6 is operating at only 15% capacity with wait times under 5 minutes."
                    },
                    {
                        "action": "Broadcast re-routing alerts on dynamic LED screens and Fan Copilot.",
                        "rank": 2,
                        "confidence": 0.92,
                        "expected_impact": "Diverts inbound traffic before they reach the overcrowded plaza.",
                        "reasoning": "Early diversion prevents queue crowding at the immediate entrance plaza."
                    }
                ],
                "overall_confidence": 0.93
            }
        else: # step >= 4
            return {
                "situation_summary": "CRITICAL INCIDENT: Fan slip/fall medical incident near overloaded Gate 5 under heavy rain.",
                "perspectives": [
                    {"role": "crowd", "assessment": "Gate 5 wait times at 52 mins. High density causes slow evacuation route.", "risk_level": "critical"},
                    {"role": "transport", "assessment": "Inbound transport high. Bus parking capacity near maximum.", "risk_level": "medium"},
                    {"role": "security", "assessment": "Security isolating medical incident site for safety and access.", "risk_level": "high"},
                    {"role": "medical", "assessment": "First response team dispatched to slip/fall patient at Gate 5.", "risk_level": "high"},
                    {"role": "weather", "assessment": "Heavy rain continues. Wet surfaces causing slick ground conditions.", "risk_level": "high"},
                    {"role": "operations", "assessment": "Gate 5 queue diversion active. Medical access route cleared.", "risk_level": "critical"}
                ],
                "recommended_actions": [
                    {
                        "action": "Clear and protect emergency medical access lane to Gate 5 entrance.",
                        "rank": 1,
                        "confidence": 0.96,
                        "expected_impact": "Ensures response team reaches patient under 2 minutes.",
                        "reasoning": "High crowd density threatens to block stretcher and response personnel access."
                    },
                    {
                        "action": "Maintain active diversion of incoming fans from Gate 5 to Gate 6.",
                        "rank": 2,
                        "confidence": 0.94,
                        "expected_impact": "Maintains flow relief at Gate 5 and prevents congestion at the incident site.",
                        "reasoning": "Reducing density around Gate 5 is critical for medical team response."
                    }
                ],
                "overall_confidence": 0.95
            }

PORT = 8000
Handler = PreviaHandler

# Allow reuse of the port address immediately after server stop
socketserver.TCPServer.allow_reuse_address = True

with http.server.ThreadingHTTPServer(("", PORT), Handler) as httpd:
    print(f"Previa Server running at http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down Previa Server.")
