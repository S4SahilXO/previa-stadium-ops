import time

def get_sensor_data_base(step=0):
    """
    Simulates stadium operations sensor data for FIFA World Cup 2026.
    Compounding steps for the live demo scenario:
      0: Baseline normal state
      1: Heavy rain starts
      2: Bus arrivals transport surge (hits Gate 5)
      3: Gate 5 overload (critical wait times and density)
      4: Medical incident near Gate 5 (slippery fall due to wet rain conditions)
    """
    # Base baseline data (Step 0)
    data = {
        "timestamp": time.time(),
        "step": step,
        "gates": {
            "Gate 1": {"wait_time": 5, "flow_rate": 80, "density": 0.2, "status": "normal"},
            "Gate 2": {"wait_time": 8, "flow_rate": 75, "density": 0.3, "status": "normal"},
            "Gate 3": {"wait_time": 6, "flow_rate": 70, "density": 0.2, "status": "normal"},
            "Gate 4": {"wait_time": 7, "flow_rate": 85, "density": 0.3, "status": "normal"},
            "Gate 5": {"wait_time": 10, "flow_rate": 90, "density": 0.4, "status": "normal"},
            "Gate 6": {"wait_time": 4, "flow_rate": 50, "density": 0.1, "status": "normal"}
        },
        "weather": {
            "temperature": 24,
            "rain_rate": 0.0,
            "wind_speed": 12,
            "visibility": "excellent",
            "status": "clear"
        },
        "transport": {
            "metro_interval_mins": 5,
            "bus_arrival_delay_mins": 0,
            "parking_occupancy_pct": 65
        },
        "incidents": {
            "active_count": 0,
            "medical_calls": 0,
            "details": []
        }
    }
    
    if step >= 1:
        # Step 1: Heavy rain starts
        data["weather"]["rain_rate"] = 15.0
        data["weather"]["wind_speed"] = 30
        data["weather"]["visibility"] = "poor"
        data["weather"]["status"] = "heavy rain"
        # Rain slows down operations slightly across all gates
        for g in data["gates"]:
            data["gates"][g]["wait_time"] += 3
            data["gates"][g]["flow_rate"] = max(10, data["gates"][g]["flow_rate"] - 10)
            data["gates"][g]["density"] = round(data["gates"][g]["density"] + 0.1, 2)
            
    if step >= 2:
        # Step 2: Bus arrival surge (transports delay/parking fills, surge hits Gate 5)
        data["transport"]["bus_arrival_delay_mins"] = 12
        data["transport"]["parking_occupancy_pct"] = 82
        # Gate 5 gets busy
        data["gates"]["Gate 5"]["wait_time"] = 22
        data["gates"]["Gate 5"]["flow_rate"] = 110
        data["gates"]["Gate 5"]["density"] = 0.7
        data["gates"]["Gate 5"]["status"] = "busy"

    if step >= 3:
        # Step 3: Gate 5 overload (critical congestion)
        data["gates"]["Gate 5"]["wait_time"] = 48
        data["gates"]["Gate 5"]["flow_rate"] = 35
        data["gates"]["Gate 5"]["density"] = 0.95
        data["gates"]["Gate 5"]["status"] = "overloaded"
        # Other gates stay relatively unchanged or clear
        data["gates"]["Gate 6"]["wait_time"] = 3
        data["gates"]["Gate 6"]["density"] = 0.08

    if step >= 4:
        # Step 4: Medical incident near Gate 5
        data["incidents"]["active_count"] = 1
        data["incidents"]["medical_calls"] = 1
        data["incidents"]["details"].append({
            "type": "medical",
            "location": "Gate 5 Entrance Plaza",
            "severity": "medium",
            "description": "Fan slipped on wet concourse floor near ticket scanning lanes."
        })
        # Gate 5 wait times remain critical
        data["gates"]["Gate 5"]["wait_time"] = 52
        data["gates"]["Gate 5"]["status"] = "critical"
        
    return data

def get_sensor_data(step=0):
    """
    Returns the current sensor data along with T+15 and T+30 minute projections.
    """
    # Current state data
    data = get_sensor_data_base(step)
    
    # 15m projection is represented by the next logical step state
    t15_data = get_sensor_data_base(min(4, step + 1))
    
    # 30m projection is represented by the step after next
    t30_data = get_sensor_data_base(min(4, step + 2))
    
    # Format and append predictions payload
    data["predictions"] = {
        "15m": {
            "gates": t15_data["gates"],
            "weather": t15_data["weather"],
            "transport": t15_data["transport"],
            "incidents": t15_data["incidents"]
        },
        "30m": {
            "gates": t30_data["gates"],
            "weather": t30_data["weather"],
            "transport": t30_data["transport"],
            "incidents": t30_data["incidents"]
        }
    }
    
    return data
