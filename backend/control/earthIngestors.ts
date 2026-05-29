import { dataBus } from "./eventBus";
import { createFile } from "./sandboxFs";
import { logAudit } from "./auditChain";
import crypto from "crypto";

export interface EarthApiConnector {
    id: string;
    url: string;
    category: string;
    requiresKey: boolean;
    tier: number;
}

// 🌍 LUCY EARTH SYSTEM — MASTER API LIST
export const EARTH_CONNECTORS: EarthApiConnector[] = [
    // 🌦️ WEATHER + ATMOSPHERE
    { id: "NOAA_WEATHER", url: "https://api.weather.gov/", category: "WEATHER", requiresKey: false, tier: 1 },
    { id: "OPEN_WEATHER", url: "https://api.openweathermap.org/data/2.5/weather", category: "WEATHER", requiresKey: true, tier: 1 },
    { id: "METEOSTAT", url: "https://meteostat.net/en/api", category: "WEATHER", requiresKey: true, tier: 2 },

    // 🧊 POLAR / EXTREME REGIONS
    { id: "NOAA_SOUTH_POLE", url: "https://gml.noaa.gov/aftp/data/meteorology/in-situ/spo/", category: "POLAR", requiresKey: false, tier: 2 },
    { id: "NSIDC_ARCTIC", url: "https://nsidc.org/data", category: "POLAR", requiresKey: false, tier: 2 },
    { id: "ARCTIC_BUOY", url: "http://iabp.apl.uw.edu/WebData", category: "POLAR", requiresKey: false, tier: 2 },

    // 🛰️ SATELLITE + EARTH IMAGERY
    { id: "NASA_API", url: "https://api.nasa.gov/", category: "SATELLITE", requiresKey: true, tier: 1 },
    { id: "NASA_IMAGERY", url: "https://api.nasa.gov/planetary/earth/imagery", category: "SATELLITE", requiresKey: true, tier: 1 },
    { id: "NOAA_GOES", url: "https://www.star.nesdis.noaa.gov/GOES/", category: "SATELLITE", requiresKey: false, tier: 2 },
    { id: "COPERNICUS_EU", url: "https://scihub.copernicus.eu/", category: "SATELLITE", requiresKey: true, tier: 2 },

    // 🌊 OCEAN + CLIMATE
    { id: "NOAA_OCEAN", url: "https://api.tidesandcurrents.noaa.gov/api/prod/", category: "OCEAN", requiresKey: false, tier: 1 },
    { id: "MARINE_WEATHER", url: "https://marine-api.open-meteo.com/", category: "OCEAN", requiresKey: false, tier: 2 },

    // 🌋 GEOLOGICAL
    { id: "USGS_EARTHQUAKES", url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", category: "GEOLOGICAL", requiresKey: false, tier: 1 },
    { id: "USGS_VOLCANO", url: "https://volcanoes.usgs.gov/vhp/api/", category: "GEOLOGICAL", requiresKey: false, tier: 2 },

    // 🌍 GEOSPATIAL
    { id: "OSM_OVERPASS", url: "https://overpass-api.de/api/interpreter", category: "GEOSPATIAL", requiresKey: false, tier: 2 },
    { id: "MAPBOX", url: "https://api.mapbox.com/", category: "GEOSPATIAL", requiresKey: true, tier: 2 },
    { id: "GOOGLE_MAPS", url: "https://maps.googleapis.com/maps/api/", category: "GEOSPATIAL", requiresKey: true, tier: 2 },

    // 🚗 TRANSPORT
    { id: "OPENSKY_AERO", url: "https://opensky-network.org/api", category: "TRANSPORT", requiresKey: false, tier: 2 },
    { id: "ADSB_EXCHANGE", url: "https://www.adsbexchange.com/data/", category: "TRANSPORT", requiresKey: true, tier: 2 },

    // 📊 DEMOGRAPHICS
    { id: "US_CENSUS", url: "https://api.census.gov/data.html", category: "DEMOGRAPHICS", requiresKey: true, tier: 1 },
    { id: "WORLD_BANK", url: "https://api.worldbank.org/v2/", category: "DEMOGRAPHICS", requiresKey: false, tier: 2 },

    // 📰 NEWS + SIGNALS
    { id: "NEWS_API", url: "https://newsapi.org/", category: "NEWS", requiresKey: true, tier: 2 },
    { id: "GDELT", url: "https://api.gdeltproject.org/api/v2/doc/doc", category: "NEWS", requiresKey: false, tier: 2 }
];

export async function executeEarthIngestion(apiId: string) {
    const connector = EARTH_CONNECTORS.find(c => c.id === apiId);
    if (!connector) throw new Error(`Unknown Earth Connector: ${apiId}`);

    console.log(`[EARTH_INGESTOR] Resolving external telemetry via: ${connector.url}`);
    
    // Abstract fetch sequence to synthesize structured JSON out of real/mock responses
    let rawPayload: any = {};

    try {
        if (!connector.requiresKey) {
            // Test fetch for open APIs
            // e.g. for USGS Earthquakes we can genuinely snag real data. For safety in demo context we'll mock normalized response, but in prod we 'await fetch(connector.url)'
            rawPayload = { status: "MOCKED_OR_FETCHED", timestamp: Date.now(), metadata: { origin: connector.url } };
        } else {
            rawPayload = { status: "KEY_REQUIRED_MOCK", timestamp: Date.now(), metadata: { origin: connector.url } };
        }
    } catch(e: any) {
        rawPayload = { error: e.message };
    }

    // NORMALIZE to Structured JSON target formats based on Category
    const structuredIntel = {
        ingestId: crypto.randomUUID(),
        connectorId: connector.id,
        category: connector.category,
        processedAt: new Date().toISOString(),
        payload: rawPayload
    };

    // STORE in governed Sandbox boundaries strictly enforcing isolation
    const relativeSandboxPath = `Earth_Data/${connector.category}/${connector.id}_latest.json`;
    await createFile(relativeSandboxPath, JSON.stringify(structuredIntel, null, 2));

    // AUDIT LOG
    logAudit({ type: "EARTH_DATA_INGESTION", connector: connector.id, sandboxPath: relativeSandboxPath });

    // FEED PATTERN ENGINE (Emit straight to E.M.M.A Spine)
    dataBus.emit("EARTH.INTEL", {
        type: "EARTH.INTEL",
        payload: {
            connectorCategory: connector.category,
            source: connector.id,
            drift: Math.random() * 0.1, // Simulated baseline drift metric applied to generic payload
            timestamp: Date.now()
        }
    });

    return structuredIntel;
}

// Function to kick off prioritized pipeline
export async function runPriorityIngestions() {
    const prioritySources = ["NOAA_WEATHER", "NASA_API", "NASA_IMAGERY", "USGS_EARTHQUAKES", "US_CENSUS", "OPEN_WEATHER"];
    
    for (const sourceId of prioritySources) {
       try {
           await executeEarthIngestion(sourceId);
       } catch (e) {
           console.error(`Priority Ingestion Failed for ${sourceId}`, e);
       }
    }
}
