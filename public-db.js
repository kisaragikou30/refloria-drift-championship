(() => {
  function formatDate(date) {
    const d = new Date(date + "T00:00:00");
    const w = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")} ${w[d.getDay()]}`;
  }

  async function loadNextEvent() {
    if (!window.supabase || !window.REFLORIA_SUPABASE_URL || !window.REFLORIA_SUPABASE_KEY) return;

    const client = window.supabase.createClient(
      window.REFLORIA_SUPABASE_URL,
      window.REFLORIA_SUPABASE_KEY
    );

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone:"Asia/Tokyo", year:"numeric", month:"2-digit", day:"2-digit"
    }).format(new Date());

    const { data, error } = await client
      .from("events")
      .select("*")
      .gte("event_date", today)
      .order("event_date", {ascending:true})
      .order("event_time", {ascending:true})
      .limit(1);

    if (error || !data?.[0]) {
      console.error("REFLORIA NEXT EVENT:", error);
      return;
    }

    const e = data[0];
    const date = formatDate(e.event_date);
    const time = String(e.event_time || "").slice(0,5);

    // New large hero panel
    document.querySelectorAll("[data-hero-event-date]").forEach(el => el.textContent = date);
    document.querySelectorAll("[data-hero-event-time]").forEach(el => el.textContent = time);
    document.querySelectorAll("[data-hero-event-name]").forEach(el => el.textContent = e.event_name || "");
    document.querySelectorAll("[data-hero-event-location]").forEach(el => el.textContent = e.event_location || "TBD");
    document.querySelectorAll("[data-hero-event-host]").forEach(el => el.textContent = `HOST / ${e.host || "—"}`);
    document.querySelectorAll("[data-hero-event-prize]").forEach(el => el.textContent = `PRIZE / ${e.prize || "—"}`);

    // Existing small hero stats
    document.querySelectorAll("[data-event-date]").forEach(el => el.textContent = date);
    document.querySelectorAll("[data-event-time]").forEach(el => el.textContent = time);
    document.querySelectorAll("[data-event-location]").forEach(el => el.textContent = e.event_location || "TBD");

    // Existing event card (if present)
    document.querySelectorAll("[data-event-name]").forEach(el => el.textContent = e.event_name || "");
  }

  async function loadDriversCount() {
    if (!window.supabase || !window.REFLORIA_SUPABASE_URL || !window.REFLORIA_SUPABASE_KEY) return;
    const client = window.supabase.createClient(window.REFLORIA_SUPABASE_URL, window.REFLORIA_SUPABASE_KEY);
    const { data, error } = await client.from("drivers").select("id");
    if (!error) {
      document.querySelectorAll("[data-drivers-count]").forEach(el => el.textContent = data?.length ?? 0);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadNextEvent();
    loadDriversCount();
  });
})();