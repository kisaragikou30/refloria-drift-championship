const { createClient } = supabase;
const refloriaDB = createClient(window.REFLORIA_SUPABASE_URL, window.REFLORIA_SUPABASE_KEY);

function fmtDate(dateStr, withDay = true) {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr + "T00:00:00");
  const days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const base = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
  return withDay ? `${base} ${days[d.getDay()]}` : `${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")} ${days[d.getDay()]}`;
}

function safeText(el, value) { if (el && value != null) el.textContent = value; }

async function loadRefloriaData() {
  const { data: event, error: eventError } = await refloriaDB.from("event_settings").select("*").order("id", { ascending: false }).limit(1).maybeSingle();
  if (!eventError && event) {
    document.querySelectorAll("[data-event-name]").forEach(e => safeText(e, event.event_name));
    document.querySelectorAll("[data-event-location]").forEach(e => safeText(e, event.event_location));
    document.querySelectorAll("[data-event-date]").forEach(e => safeText(e, fmtDate(event.event_date)));
    document.querySelectorAll("[data-event-date-short]").forEach(e => safeText(e, fmtDate(event.event_date, false)));
    document.querySelectorAll("[data-event-time]").forEach(e => safeText(e, (event.event_time || "").slice(0,5)));
    document.querySelectorAll("[data-event-prize]").forEach(e => safeText(e, event.prize || ""));
    document.querySelectorAll("[data-event-description]").forEach(e => safeText(e, event.description || ""));
    document.querySelectorAll("[data-event-host]").forEach(e => safeText(e, event.host || ""));
  }

  const { data: drivers, error: driverError } = await refloriaDB.from("drivers").select("*").order("id", { ascending: true });
  if (!driverError) {
    document.querySelectorAll("[data-drivers-count]").forEach(e => safeText(e, drivers?.length || 0));
    const grids = document.querySelectorAll("[data-drivers-grid]");
    grids.forEach(grid => {
      if (!drivers?.length) { grid.innerHTML = '<div class="driver-card reveal"><div class="driver-photo photo-a"><span>--</span></div><div class="driver-info"><small>REGISTERED</small><h3>NO DRIVERS YET</h3><p>ENTRY OPEN</p></div></div>'; return; }
      grid.innerHTML = drivers.map((d,i) => `
        <article class="driver-card reveal">
          <div class="driver-photo photo-${String.fromCharCode(97+(i%4))}"><span>#${escapeHtml(d.number || String(i+1))}</span></div>
          <div class="driver-info"><small>DRIVER</small><h3>${escapeHtml(d.name)}</h3><p>${escapeHtml(d.car || 'CAR TBD')}</p></div>
        </article>`).join('');
    });
  }
}

function escapeHtml(v) { return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }

loadRefloriaData();
