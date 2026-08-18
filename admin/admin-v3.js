const client = supabase.createClient(
  window.REFLORIA_SUPABASE_URL,
  window.REFLORIA_SUPABASE_KEY
);
const $ = id => document.getElementById(id);

async function start(){
  const {data} = await client.auth.getSession();
  if(data.session) showApp();
}
$("loginBtn").onclick = async () => {
  const {error} = await client.auth.signInWithPassword({
    email: $("email").value,
    password: $("password").value
  });
  $("loginMsg").textContent = error ? error.message : "ログイン成功";
  if(!error) showApp();
};
$("logout").onclick = async () => {
  await client.auth.signOut();
  location.reload();
};

function showApp(){
  $("login").hidden = true;
  $("app").hidden = false;
  loadEvents();
  loadDrivers();
}

document.querySelectorAll("[data-page]").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("[data-page]").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    const drivers = btn.dataset.page === "drivers";
    $("eventsPage").hidden = drivers;
    $("driversPage").hidden = !drivers;
  };
});

function esc(s){
  return String(s ?? "").replace(/[&<>"']/g,m=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function formatDate(s){
  if(!s) return "—";
  const d = new Date(s + "T00:00:00");
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}

async function loadEvents(){
  const {data,error} = await client.from("events")
    .select("*")
    .order("event_date",{ascending:true})
    .order("event_time",{ascending:true});

  if(error){
    $("saveMsg").textContent = error.message;
    return;
  }

  $("eventList").innerHTML = (data || []).map(e => `
    <div class="event-row" style="padding:18px 0;border-top:1px solid #252936;display:flex;justify-content:space-between;align-items:center;gap:16px">
      <div>
        <strong style="font-size:18px">${esc(e.event_name)}</strong>
        <div style="color:#9297a5;margin-top:6px">
          ${formatDate(e.event_date)} ${esc((e.event_time||"").slice(0,5))}
          ／ ${esc(e.event_location)}
        </div>
        <div style="color:#6f7482;font-size:12px;margin-top:5px">
          HOST / ${esc(e.host || "—")} ／ ${esc(e.prize || "—")}
        </div>
      </div>
      <button class="delete-btn" style="background:#4a1820;border:1px solid #9d3c4b;color:#fff;padding:9px 13px;cursor:pointer" onclick="deleteEvent(${e.id})">
        削除
      </button>
    </div>
  `).join("") || "<p>登録されている大会はありません。</p>";
}

$("eventForm").onsubmit = async e => {
  e.preventDefault();

  const payload = {
    event_name: $("eventName").value.trim(),
    event_date: $("eventDate").value,
    event_time: $("eventTime").value,
    event_location: $("eventLocation").value.trim(),
    host: $("eventHost").value.trim(),
    prize: $("eventPrize").value.trim(),
    description: $("eventDescription").value.trim(),
    drift_only: $("driftOnly").checked,
    tcs_off: $("tcsOff").checked,
    non_custom: $("nonCustom").checked,
    judge_review: $("judgeReview").checked
  };

  const {error} = await client.from("events").insert(payload);
  $("saveMsg").textContent = error ? error.message : "イベントを追加しました ✓";

  if(!error){
    e.target.reset();
    loadEvents();
  }
};

async function deleteEvent(id){
  const {data:event,error:findError} = await client
    .from("events")
    .select("event_name,event_date")
    .eq("id",id)
    .maybeSingle();

  if(findError){
    $("saveMsg").textContent = findError.message;
    return;
  }

  const label = event ? `${event.event_name} (${event.event_date})` : "この大会";
  if(!confirm(`${label}\n\nこの大会を削除しますか？\n公開サイトからも消えます。`)) return;

  const {error} = await client.from("events").delete().eq("id",id);

  if(error){
    $("saveMsg").textContent = error.message;
    return;
  }

  $("saveMsg").textContent = "大会を削除しました ✓";
  loadEvents();
}

async function loadDrivers(){
  const {data,error} = await client.from("drivers")
    .select("*").order("id");

  if(error){
    const el = $("driverList");
    if(el) el.innerHTML = `<p>${esc(error.message)}</p>`;
    return;
  }

  $("driverList").innerHTML = (data || []).map(d => `
    <div style="padding:12px 0;border-top:1px solid #252936">
      #${esc(d.number||"—")} ／ ${esc(d.name)} ／ ${esc(d.car||"—")}
    </div>
  `).join("") || "<p>選手がまだ登録されていません。</p>";
}

$("driverForm").onsubmit = async e => {
  e.preventDefault();

  const {error} = await client.from("drivers").insert({
    number: $("driverNumber")?.value.trim() || "",
    name: $("driverName").value.trim(),
    car: $("driverCar").value.trim()
  });

  $("driverMsg").textContent = error ? error.message : "選手を追加しました ✓";

  if(!error){
    e.target.reset();
    loadDrivers();
  }
};

start();
