(() => {
  const client = window.supabase.createClient(
    window.REFLORIA_SUPABASE_URL,
    window.REFLORIA_SUPABASE_KEY
  );

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[m]));

  function formatDate(date) {
    const d = new Date(date + "T00:00:00");
    const weekdays = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")} ${weekdays[d.getDay()]}`;
  }

  async function loadUpcomingEvents() {
    const root = document.querySelector("#upcoming-events");
    if (!root) return;

    const today = new Date();
    today.setHours(0,0,0,0);
    const todayISO = today.toISOString().slice(0,10);

    const { data, error } = await client
      .from("events")
      .select("*")
      .gte("event_date", todayISO)
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true })
      .limit(3);

    if (error) {
      root.innerHTML = `<p>イベント情報を読み込めませんでした。</p>`;
      console.error(error);
      return;
    }

    if (!data || data.length === 0) {
      root.innerHTML = `<p>次回開催予定のイベントはありません。</p>`;
      document.querySelectorAll("[data-event-date]").forEach(el => el.textContent = "TBD");
      document.querySelectorAll("[data-event-time]").forEach(el => el.textContent = "");
      document.querySelectorAll("[data-event-location]").forEach(el => el.textContent = "TBD");
      return;
    }

    // The first event is always the nearest future event.
    const next = data[0];

    document.querySelectorAll("[data-event-date]").forEach(el => {
      el.textContent = formatDate(next.event_date);
    });
    document.querySelectorAll("[data-event-time]").forEach(el => {
      el.textContent = String(next.event_time || "").slice(0,5);
    });
    document.querySelectorAll("[data-event-location]").forEach(el => {
      el.textContent = next.event_location || "TBD";
    });

    root.innerHTML = data.map((e, i) => `
      <article class="upcoming-card ${i === 0 ? "next-event" : ""}">
        <div class="upcoming-num">${i === 0 ? "NEXT EVENT" : "EVENT " + String(i+1).padStart(2,"0")}</div>
        <div class="upcoming-date">${formatDate(e.event_date)} <b>${esc(String(e.event_time || "").slice(0,5))}</b></div>
        <h3>${esc(e.event_name)}</h3>
        <p>📍 ${esc(e.event_location || "TBD")}</p>
        ${e.host ? `<span>HOST / ${esc(e.host)}</span>` : ""}
        ${e.prize ? `<span> / ${esc(e.prize)}</span>` : ""}
        <div class="upcoming-tags">
          ${e.drift_only ? "<i>DRIFT ONLY</i>" : ""}
          ${e.tcs_off ? "<i>TCS OFF</i>" : ""}
          ${e.non_custom ? "<i>NON CUSTOM</i>" : ""}
          ${e.judge_review ? "<i>JUDGE REVIEW</i>" : ""}
        </div>
      </article>
    `).join("");
  }

  async function loadDriversCount() {
    const { data, error } = await client.from("drivers").select("id");
    if (!error) {
      document.querySelectorAll("[data-drivers-count]").forEach(el => {
        el.textContent = data?.length ?? 0;
      });
    }
  }

  loadUpcomingEvents();
  loadDriversCount();
})();