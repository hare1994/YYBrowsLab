// Serves the static site and counts anonymous usage events for conversion tracking.
// The page sends /e?n=<event>&v=<detail>; each event is one log line, visible in the Cloudflare dashboard
// (Workers & Pages -> yybrowslab -> Observability -> Logs/Events). No photo, name, IP or other personal data is logged.
const EVENTS = new Set(["page_view", "photo_chosen", "scan_done", "scan_blocked", "wa_click", "share_click", "more_open", "magic_view"]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/e") {
      const name = (url.searchParams.get("n") || "").slice(0, 32);
      const detail = (url.searchParams.get("v") || "").replace(/[^a-z0-9_\-]/gi, "").slice(0, 32);
      if (EVENTS.has(name)) {
        const ua = request.headers.get("user-agent") || "";
        console.log(JSON.stringify({event: name, detail: detail || undefined,
          device: /Mobi|Android|iPhone/i.test(ua) ? "mobile" : "desktop", inApp: /Instagram|FBAN|FBAV/i.test(ua) || undefined}));
      }
      return new Response(null, {status: 204, headers: {"cache-control": "no-store"}});
    }
    return env.ASSETS.fetch(request);
  }
};
