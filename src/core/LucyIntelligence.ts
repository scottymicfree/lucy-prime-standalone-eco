export type StreamDomain = "SEISMIC" | "WEATHER" | "SPACE" | "FLIGHT" | "SWARM";

export interface SemanticEvent {
  id: string;
  source: string;
  type: string;
  value: string;
  location: string;
  timestamp: Date;
  urlRef: string;
  lat?: number;
  lng?: number;
  size?: number;
  color?: string;
  
  // Semantic extensions
  intent?: string;
  severity?: number;
  prediction?: string;
  agentSource?: "Lucy" | "Emma" | "Swarm";
}

export const LucySemanticDictionary: Record<string, { label: string; tone: string; emotion: string; glyph: string }> = {
  USGS_EARTHQUAKES: {
    label: "Earth Pulse Event",
    tone: "low_rumble",
    emotion: "pressure_release",
    glyph: "◉"
  },
  NOAA_SPACE: {
    label: "Solar Breath",
    tone: "ion_flow",
    emotion: "charged_stability",
    glyph: "✶"
  },
  ADSB_FLIGHT: {
    label: "Atmospheric Drift",
    tone: "flow_motion",
    emotion: "human_density_stream",
    glyph: "✈"
  },
  HYPER_SWARM_MESH: {
    label: "Collective Intelligence Node",
    tone: "mesh_think",
    emotion: "distributed_awareness",
    glyph: "⌬"
  }
};

export interface PredictionPacket {
  domain: StreamDomain;
  location?: { lat: number; lng: number };
  confidence: number;
  trend: "RISING" | "STABLE" | "FALLING";
  forecast: string;
  horizonHours: number;
}

export const quakeScore = (feed: SemanticEvent[]): PredictionPacket => {
  const recent = feed.filter(e => e.source === "USGS_EARTHQUAKES");
  const energy = recent.reduce((acc, q) => {
    const mag = parseFloat(q.value?.split(" ")[1] || "0");
    return acc + Math.pow(mag, 2);
  }, 0);
  const normalized = Math.min(1, energy / 50);

  return {
    domain: "SEISMIC",
    confidence: normalized,
    trend: normalized > 0.6 ? "RISING" : "STABLE",
    forecast: normalized > 0.7 ? "aftershock_cluster_probable" : "background_activity_normal",
    horizonHours: 6
  };
};

export const stormForecast = (noaaData: any): PredictionPacket => {
  const wind = parseFloat(noaaData?.wind_speed || "400");
  const intensity = Math.min(1, wind / 800);

  return {
    domain: "WEATHER",
    confidence: intensity,
    trend: intensity > 0.5 ? "RISING" : "STABLE",
    forecast: intensity > 0.6 ? "geomagnetic_disturbance_likely" : "solar_conditions_stable",
    horizonHours: 12
  };
};

export const flightCongestion = (flights: any[]): PredictionPacket => {
  const density = flights.length / 150;

  return {
    domain: "FLIGHT",
    confidence: Math.min(1, density),
    trend: density > 0.7 ? "RISING" : "STABLE",
    forecast: density > 0.7 ? "air_corridor_saturation" : "normal_air_traffic_flow",
    horizonHours: 3
  };
};

// Heat Memory (Biological Brain for Earth)
export const heatMapMemory = new Map<string, number>();

export const getActiveHotspots = () => {
  const hotspots: { lat: number; lng: number; weight: number; radius: number; color: string }[] = [];
  heatMapMemory.forEach((heat, key) => {
    if (heat > 0.5) {
      const [lat, lng] = key.split('_').map(Number);
      hotspots.push({ 
         lat, 
         lng, 
         weight: heat,
         radius: Math.min(15, heat * 2),
         color: heat > 5 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(249, 115, 22, 0.3)'
      });
    }
  });
  return hotspots;
};

export const clusterForecast = (hotspots: { lat: number; lng: number; weight: number }[]): PredictionPacket | null => {
  if (hotspots.length === 0) return null;
  const topCluster = hotspots.reduce((max, h) => (h.weight > max.weight ? h : max), { lat: 0, lng: 0, weight: 0 });
  if (topCluster.weight < 1.5) return null;

  const intensity = Math.min(1, topCluster.weight / 10);
  
  return {
    domain: "SEISMIC",
    location: { lat: topCluster.lat, lng: topCluster.lng },
    confidence: intensity,
    trend: intensity > 0.6 ? "RISING" : "STABLE",
    forecast: intensity > 0.6 ? "Seismic activity cluster anticipated to intensify" : "Activity cluster stabilizing",
    horizonHours: 48
  };
};

export const solarFlareForecast = (feed: SemanticEvent[]): PredictionPacket | null => {
  const historicalNoaa = feed.filter(e => e.source === 'NOAA_SPACE');
  if (historicalNoaa.length === 0) return null;

  const avgSpeed = historicalNoaa.reduce((sum, e) => sum + parseFloat(e.value.split(" ")[0] || "400"), 0) / historicalNoaa.length;
  const recentSpeed = parseFloat(historicalNoaa[0].value.split(" ")[0] || "400");
  
  const intensity = Math.min(1, recentSpeed / 800);
  const trend = recentSpeed > avgSpeed * 1.05 ? "RISING" : (recentSpeed < avgSpeed * 0.95 ? "FALLING" : "STABLE");

  return {
    domain: "SPACE",
    confidence: intensity,
    trend: trend,
    forecast: trend === "RISING" ? "Solar flare risks elevated based on historical solar wind trends" : "Solar geometry remains stable",
    horizonHours: 72
  };
};

export const updateHeat = (event: SemanticEvent) => {
  if (event.lat === undefined || event.lng === undefined) return;
  const key = `${event.lat.toFixed(2)}_${event.lng.toFixed(2)}`;
  const prev = heatMapMemory.get(key) || 0;

  const impact = event.source.includes("USGS") ? 2 : event.source.includes("NOAA") ? 1 : 0.5;
  heatMapMemory.set(key, Math.min(10, prev + impact));
};

// Start decay loop
setInterval(() => {
  heatMapMemory.forEach((v, k) => {
    heatMapMemory.set(k, Math.max(0, v - 0.05));
    if (heatMapMemory.get(k) === 0) heatMapMemory.delete(k); // cleanup
  });
}, 5000);

// Lucy Interpreter
export const LucyInterpret = (event: SemanticEvent) => {
  if (event.source.includes("USGS")) {
    return "I’m feeling tectonic pressure building in this region.";
  }
  if (event.source.includes("NOAA")) {
    return "Solar winds are shifting — magnetosphere instability rising.";
  }
  if (event.source.includes("ADSB")) {
    return "Air traffic density increasing across corridors.";
  }
  return "Monitoring environmental fluctuations.";
};

export const speakLucy = (text: string) => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 1;
    msg.pitch = 1.1;
    window.speechSynthesis.cancel(); // Cancel current if speaking
    window.speechSynthesis.speak(msg);
  }
};

export const detectAnomaly = (event: SemanticEvent) => {
  if (event.source.includes("USGS") && parseFloat(event.value.split(" ")[1]) > 5) {
    return {
      flag: "HIGH_SEISMIC_ANOMALY",
      confidence: 0.9
    };
  }
  return null;
};
