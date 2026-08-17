(() => {
  // REFLORIA main site + live event loader
  const $ = (s, root=document) => root.querySelector(s);

  function initUI() {
    const header = $("header");
    window.addEventListener("scroll", () => {
      if (header) header.classList.toggle("scrolled", window.scrollY > 20);
    });

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener("click", e => {
        const target = $(a.getAttribute("href"));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    const entryButton = $("#entryButton");
    const modal = $("#entryModal");
    const modalClose = $("#modalClose");
    const modalOk = $("#modalOk");
    const openModal = () => { if (modal) { modal.setAttribute("aria-hidden","false"); modal.classList.add("open"); } };
    const closeModal = () => { if (modal) { modal.setAttribute("aria-hidden","true"); modal.classList.remove("open"); } };
    entryButton?.addEventListener("click", openModal);
    modalClose?.addEventListener("click", closeModal);
    modalOk?.addEventListener("click", closeModal);
    modal?.addEventListener("click", e => { if (e.target === modal) closeModal(); });

    const nav = $(".nav-toggle");
    const menu = $(".nav-links");
    nav?.addEventListener("click", () => menu?.classList.toggle("open"));
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, m => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  function formatDate(date) {
    const d = new Date(date + "T00:00:00");
    const w = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")} ${w[d.getDay()]}`;
  }

  async function loadLiveEvents() {
    const root = $("#upcoming-events");

    // If the old HTML is still live, create the new event area automatically.
    if (!root) {
      const section = $("#event");
      if (!section || !window.supabase || !window.REFLORIA_SUPABASE_URL) return;

      const oldHeading = section.querySelector(".section-heading");
      const grid = document.createElement("div");
      grid.id = "upcoming-events";
      grid.className = "upcoming-grid";
      if (oldHeading) oldHeading.insertAdjacentElement("afterend", grid);
    }

    const target = $("#upcoming-events");
    if (!target) return;

    if (!window.supabase || !window.REFLORIA_SUPABASE_URL || !window.REFLORIA_SUPABASE_KEY) {
      target.innerHTML = '<p>イベントデータベースに接続できません。</p>';
      return;
    }

    const client = window.supabase.createClient(
      window.REFLORIA_SUPABASE_URL,
      window.REFLORIA_SUPABASE_KEY
    );

    // Today in Japan. The site automatically ignores past events.
    const now = new Date();
    const japan = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric", month: "2-digit", day: "2-digit"
    }).format(now);

    const { data, error } = await client
      .from("events")
      .select("*")
      .gte("event_date", japan)
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true })
      .limit(3);

    if (error) {
      console.error("REFLORIA events:", error);
      target.innerHTML = `<p>イベント情報の読み込みに失敗しました。</p>`;
      return;
    }

    if (!data?.length) {
      target.innerHTML = `<p>次回開催予定のイベントはありません。</p>`;
      return;
    }

    target.innerHTML = data.map((e, i) => `
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

  async function loadDriverCount() {
    if (!window.supabase || !window.REFLORIA_SUPABASE_URL) return;
    const client = window.supabase.createClient(window.REFLORIA_SUPABASE_URL, window.REFLORIA_SUPABASE_KEY);
    const { data } = await client.from("drivers").select("id");
    document.querySelectorAll("[data-drivers-count]").forEach(el => el.textContent = data?.length ?? 0);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initUI();
    loadLiveEvents();
    loadDriverCount();
  });
})();