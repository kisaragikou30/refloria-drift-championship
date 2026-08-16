(() => {
  const $ = (id) => document.getElementById(id);

  function showMessage(message, isError = false) {
    const el = $("loginMsg");
    if (el) {
      el.textContent = message;
      el.style.color = isError ? "#ff6b8a" : "";
    }
  }

  function getClient() {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      showMessage("Supabaseの読み込みに失敗しました。ページを再読み込みしてください。", true);
      return null;
    }
    if (!window.REFLORIA_SUPABASE_URL || window.REFLORIA_SUPABASE_URL.includes("YOUR_")) {
      showMessage("Supabaseの接続設定が見つかりません。", true);
      return null;
    }
    return window.supabase.createClient(
      window.REFLORIA_SUPABASE_URL,
      window.REFLORIA_SUPABASE_KEY
    );
  }

  let client = null;

  async function init() {
    client = getClient();
    if (!client) return;

    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (data.session) {
        showApp();
      } else {
        $("login").hidden = false;
      }
    } catch (err) {
      showMessage("接続エラー: " + (err.message || err), true);
    }
  }

  async function login(e) {
    e.preventDefault();
    if (!client) client = getClient();
    if (!client) return;

    const email = $("email").value.trim();
    const password = $("password").value;

    if (!email || !password) {
      showMessage("メールアドレスとパスワードを入力してください。", true);
      return;
    }

    $("loginBtn").disabled = true;
    $("loginBtn").textContent = "LOGIN...";

    try {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showMessage("ログインしました ✓");
      showApp();
    } catch (err) {
      showMessage("ログインできません: " + (err.message || err), true);
    } finally {
      $("loginBtn").disabled = false;
      $("loginBtn").textContent = "LOGIN";
    }
  }

  function showApp() {
    $("login").hidden = true;
    $("app").hidden = false;
    $("logout").hidden = false;
    loadEvent();
    loadDrivers();
  }

  async function logout() {
    if (client) await client.auth.signOut();
    location.reload();
  }

  async function loadEvent() {
    const { data, error } = await client
      .from("event_settings")
      .select("*")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      $("saveMsg").textContent = "読み込みエラー: " + error.message;
      return;
    }
    if (!data) return;

    $("eventName").value = data.event_name || "";
    $("eventDate").value = data.event_date || "";
    $("eventTime").value = data.event_time ? data.event_time.slice(0, 5) : "";
    $("eventLocation").value = data.event_location || "";
    $("eventHost").value = data.host || "";
    $("eventPrize").value = data.prize || "";
    $("eventDescription").value = data.description || "";
    $("driftOnly").checked = !!data.drift_only;
    $("tcsOff").checked = !!data.tcs_off;
    $("nonCustom").checked = !!data.non_custom;
    $("judgeReview").checked = !!data.judge_review;
  }

  async function saveEvent(e) {
    e.preventDefault();

    const payload = {
      event_name: $("eventName").value,
      event_date: $("eventDate").value,
      event_time: $("eventTime").value,
      event_location: $("eventLocation").value,
      host: $("eventHost").value,
      prize: $("eventPrize").value,
      description: $("eventDescription").value,
      drift_only: $("driftOnly").checked,
      tcs_off: $("tcsOff").checked,
      non_custom: $("nonCustom").checked,
      judge_review: $("judgeReview").checked,
      updated_at: new Date().toISOString()
    };

    const { data: old, error: findError } = await client
      .from("event_settings")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      $("saveMsg").textContent = "保存エラー: " + findError.message;
      return;
    }

    let result;
    if (old) {
      result = await client.from("event_settings").update(payload).eq("id", old.id);
    } else {
      result = await client.from("event_settings").insert(payload);
    }

    $("saveMsg").textContent = result.error
      ? "保存エラー: " + result.error.message
      : "保存しました ✓";

    if (!result.error) loadEvent();
  }

  async function loadDrivers() {
    const list = $("driverList");
    const { data, error } = await client.from("drivers").select("*").order("id", { ascending: true });

    if (error) {
      list.textContent = "読み込みエラー: " + error.message;
      return;
    }

    list.innerHTML = (data || []).map(d => `
      <div class="driver">
        <b>${esc(d.name)}</b>
        <span>${esc(d.car || "—")}</span>
        <span>${esc(d.team || "—")}</span>
        <button type="button" data-delete="${d.id}">削除</button>
      </div>
    `).join("") || "<p>選手がまだいません。</p>";

    list.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", () => deleteDriver(btn.dataset.delete));
    });
  }

  async function addDriver(e) {
    e.preventDefault();
    const { error } = await client.from("drivers").insert({
      name: $("driverName").value.trim(),
      car: $("driverCar").value.trim(),
      team: $("driverTeam").value.trim()
    });

    if (error) {
      alert("追加エラー: " + error.message);
      return;
    }

    e.target.reset();
    loadDrivers();
  }

  async function deleteDriver(id) {
    if (!confirm("この選手を削除しますか？")) return;
    const { error } = await client.from("drivers").delete().eq("id", id);
    if (error) alert("削除エラー: " + error.message);
    loadDrivers();
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, m => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
    }[m]));
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("loginBtn").addEventListener("click", login);
    $("logout").addEventListener("click", logout);
    $("eventForm").addEventListener("submit", saveEvent);
    $("driverForm").addEventListener("submit", addDriver);

    document.querySelectorAll("nav button").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("nav button").forEach(x => x.classList.remove("active"));
        btn.classList.add("active");
        $("eventPage").hidden = btn.dataset.page !== "event";
        $("driversPage").hidden = btn.dataset.page !== "drivers";
      });
    });

    init();
  });
})();
