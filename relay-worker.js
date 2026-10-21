// Optional relay for Paper Trading Desk.
// Only needed if the app's connection check says Safari can't reach Alpaca's market-data service directly.
//
// Cloudflare Workers (free plan): Create Worker -> replace the starter code with this file ->
// set ALLOWED_ORIGIN to the address you open the app from -> Deploy -> copy the worker's https address
// into the app under Settings -> Relay address.
//
// The relay passes your Alpaca keys through on each request and stores nothing. It only reaches
// Alpaca's PAPER trading service and the market-data service.

const ALLOWED_ORIGIN = "https://kphudsond.github.io"; // the address the app is opened from: scheme and host only

const UPSTREAM = {
  "/trading": "https://paper-api.alpaca.markets",
  "/data": "https://data.alpaca.markets"
};
const PASS_HEADERS = ["APCA-API-KEY-ID", "APCA-API-SECRET-KEY", "Content-Type"];

export default {
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": PASS_HEADERS.join(", "),
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    };
    if ((request.headers.get("Origin") || "") !== ALLOWED_ORIGIN) {
      return new Response("Origin not allowed", { status: 403, headers: cors });
    }
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "GET" && request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    const url = new URL(request.url);
    const prefix = Object.keys(UPSTREAM).find((p) => url.pathname.startsWith(p + "/"));
    if (!prefix) return new Response("Not found", { status: 404, headers: cors });

    const headers = new Headers();
    for (const name of PASS_HEADERS) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    const upstream = await fetch(UPSTREAM[prefix] + url.pathname.slice(prefix.length) + url.search, {
      method: request.method,
      headers,
      body: request.method === "POST" ? await request.text() : undefined
    });
    const response = new Response(upstream.body, upstream);
    for (const [k, v] of Object.entries(cors)) response.headers.set(k, v);
    return response;
  }
};
