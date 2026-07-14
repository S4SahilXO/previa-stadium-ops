import os
import json
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
import simulator

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
            data = self.get_mock_synthesis(step)
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

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Previa Server running at http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down Previa Server.")
