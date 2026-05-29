import requests
import time

def calculate_seismic_pressure():
    # USGS GeoJSON for all quakes in the last hour
    url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"
    try:
        response = requests.get(url).json()
        quakes = response['features']
        
        # Calculate impact: Magnitude * depth factor (simplified here)
        total_pressure = 0
        for quake in quakes:
            mag = quake['properties']['mag']
            if mag and mag > 2.5: # Only count significant movements
                total_pressure += (mag ** 2)
                
        # Normalize to a 0.0 - 1.0 scale for Earth Stability
        normalized_drift = min(total_pressure / 100, 0.5)
        return normalized_drift
        
    except Exception as e:
        print(f"Connection Error: {e}")
        return 0

# Loop to feed EMMA
if __name__ == "__main__":
    print("Initiating Python USGS Ingestor (Sensor)...")
    while True:
        drift_value = calculate_seismic_pressure()
        
        # PUSH TO LUCY API
        try:
            res = requests.post("http://localhost:3000/api/kernel/drift", json={"seismic": drift_value})
            print(f"Current Seismic Drift: {drift_value:.4f} | API Status: {res.status_code}")
        except Exception as api_err:
            print(f"Current Seismic Drift: {drift_value:.4f} | API Error: Not connected ({api_err})")
            
        time.sleep(300)
