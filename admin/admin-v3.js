let client=null;
const $=id=>document.getElementById(id);
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function setText(id,text,error=false){const el=$(id);if(!el)return;el.textContent=text||"";el.style.color=error?"#ff7d8c":"";}
function formatDate(s){if(!s)return"—";const d=new Date(s+"T00:00:00");return`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;}
async function start(){try{if(!window.supabase)throw new Error("Supabaseライブラリが読み込まれていません。");if(!window.REFLORIA_SUPABASE_URL||!window.REFLORIA_SUPABASE_KEY)throw new Error("supabase-config.js が読み込めていません。");client=window.supabase.createClient(window.REFLORIA_SUPABASE_URL,window.REFLORIA_SUPABASE_KEY);const{data,error}=await client.auth.getSession();if(error)throw error;if(data.session)showApp();}catch(e){setText("loginMsg",e.message,true);}}
$("loginBtn").onclick=async()=>{try{if(!client)throw new Error("Supabaseに接続できていません。");$("loginBtn").disabled=true;setText("loginMsg","ログイン中...");const{error}=await client.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error)throw error;setText("loginMsg","ログイン成功 ✓");showApp();}catch(e){setText("loginMsg",e.message,true);}finally{$("loginBtn").disabled=false;}};
$("logout").onclick=async()=>{if(client)await client.auth.signOut();location.reload();};
function showApp(){$("login").hidden=true;$("app").hidden=false;loadEvents();loadDrivers();loadPointEvents();}
document.querySelectorAll("[data-page]").forEach(btn=>{btn.onclick=()=>{document.querySelectorAll("[data-page]").forEach(x=>x.classList.remove("active"));btn.classList.add("active");const drivers=btn.dataset.page==="drivers";$("eventsPage").hidden=drivers;$("driversPage").hidden=!drivers;if(drivers){loadDrivers();loadPointEvents();}};});
async function loadEvents(){const{data,error}=await client.from("events").select("*").order("event_date",{ascending:true}).order("event_time",{ascending:true});if(error){setText("saveMsg",error.message,true);return;}$("eventList").innerHTML=(data||[]).map(e=>`<div class="event-row" style="padding:18px 0;border-top:1px solid #252936;display:flex;justify-content:space-between;align-items:center;gap:16px"><div><strong style="font-size:18px">${esc(e.event_name)}</strong><div style="color:#9297a5;margin-top:6px">${formatDate(e.event_date)} ${esc((e.event_time||"").slice(0,5))} ／ ${esc(e.event_location)}</div><div style="color:#6f7482;font-size:12px;margin-top:5px">HOST / ${esc(e.host||"—")} ／ ${esc(e.prize||"—")}</div></div><button style="background:#4a1820;border:1px solid #9d3c4b;color:#fff;padding:9px 13px;cursor:pointer" onclick="deleteEvent(${Number(e.id)})">削除</button></div>`).join("")||"<p>登録されている大会はありません。</p>";}
$("eventForm").onsubmit=async e=>{e.preventDefault();const payload={event_name:$("eventName").value.trim(),event_date:$("eventDate").value,event_time:$("eventTime").value,event_location:$("eventLocation").value.trim(),host:$("eventHost").value.trim(),prize:$("eventPrize").value.trim(),description:$("eventDescription").value.trim(),drift_only:$("driftOnly").checked,tcs_off:$("tcsOff").checked,non_custom:$("nonCustom").checked,judge_review:$("judgeReview").checked};const{error}=await client.from("events").insert(payload);if(error){setText("saveMsg",error.message,true);return;}e.target.reset();setText("saveMsg","イベントを追加しました ✓");loadEvents();loadPointEvents();};
async function deleteEvent(id){const{data:event,error:findError}=await client.from("events").select("event_name,event_date").eq("id",id).maybeSingle();if(findError){setText("saveMsg",findError.message,true);return;}const label=event?`${event.event_name} (${event.event_date})`:"この大会";if(!confirm(`${label}\n\nこの大会を削除しますか？\n公開サイトからも消えます。`))return;const{error}=await client.from("events").delete().eq("id",id);if(error){setText("saveMsg",error.message,true);return;}setText("saveMsg","大会を削除しました ✓");loadEvents();loadPointEvents();}window.deleteEvent=deleteEvent;
async function loadDrivers(){const el=$("driverList");if(!el||!client)return;const{data,error}=await client.from("drivers").select("id,number,name,car,team,photo_url").order("number",{ascending:true});if(error){el.innerHTML=`<p style="color:#ff7d8c">${esc(error.message)}</p>`;return;}el.innerHTML=(data||[]).map(d=>`<div class="driver"><strong>#${esc(d.number||"—")}</strong><span>${esc(d.name||"—")}</span><span>${esc(d.car||"—")}</span><span>${esc(d.team||"—")}</span><span>${d.photo_url?'<span class="photo-ok">登録済み</span>':'—'}</span><span class="driver-actions"><button type="button" class="photo-edit" onclick="editDriverPhoto(${Number(d.id)})">写真</button><button type="button" onclick="deleteDriver(${Number(d.id)})">削除</button></span></div>`).join("")||"<p>選手がまだ登録されていません。</p>";}
$("driverForm").onsubmit=async e=>{e.preventDefault();const number=$("driverNumber").value.trim(),name=$("driverName").value.trim(),car=$("driverCar").value.trim(),team=$("driverTeam").value.trim(),photo_url=$("driverPhoto").value.trim();if(!number||!name){setText("driverMsg","番号と選手名を入力してください。",true);return;}const btn=e.target.querySelector("button[type=submit]");btn.disabled=true;const{error}=await client.from("drivers").insert({number,name,car,team,photo_url});btn.disabled=false;if(error){setText("driverMsg",error.message,true);return;}e.target.reset();setText("driverMsg","選手を追加しました ✓");loadDrivers();};
async function editDriverPhoto(id){const{data,error}=await client.from("drivers").select("name,photo_url").eq("id",id).maybeSingle();if(error){setText("driverMsg",error.message,true);return;}if(!data)return;const value=prompt(`${data.name} の写真URLを入力してください。\n空欄で写真を削除できます。`,data.photo_url||"");if(value===null)return;const{error:updateError}=await client.from("drivers").update({photo_url:value.trim()}).eq("id",id);if(updateError){setText("driverMsg",updateError.message,true);return;}setText("driverMsg",value.trim()?"写真URLを更新しました ✓":"写真を削除しました ✓");loadDrivers();}window.editDriverPhoto=editDriverPhoto;
async function deleteDriver(id){if(!confirm("この選手を削除しますか？\n公開サイトのDRIVERS表示とポイント記録からも消えます。"))return;const{error}=await client.from("drivers").delete().eq("id",id);if(error){setText("driverMsg",error.message,true);return;}setText("driverMsg","選手を削除しました ✓");loadDrivers();loadPointEvents();}window.deleteDriver=deleteDriver;

async function loadPointEvents(){
  const sel=$("pointEvent");
  if(!sel||!client)return;
  const{data,error}=await client.from("events").select("id,event_name,event_date").order("event_date",{ascending:false});
  if(error){setText("pointMsg",error.message,true);return;}
  const old=sel.value;
  sel.innerHTML=(data||[]).map(e=>`<option value="${Number(e.id)}">${esc(e.event_name)} — ${formatDate(e.event_date)}</option>`).join("");
  if(old&&[...sel.options].some(o=>o.value===old))sel.value=old;
  if(sel.value)loadPointEditor();else $("pointRows").innerHTML='<p>先に大会を登録してください。</p>';
}
$("pointEvent").addEventListener("change",loadPointEditor);
$("loadPointBtn").onclick=loadPointEditor;

async function loadPointEditor(){
  const eventId=Number($("pointEvent").value);
  if(!eventId)return;
  const{data:drivers,error:de}=await client.from("drivers").select("id,number,name,car,team").order("number",{ascending:true});
  if(de){setText("pointMsg",de.message,true);return;}
  const{data:points,error:pe}=await client.from("driver_event_points").select("id,event_id,driver_id,points").eq("event_id",eventId);
  if(pe){setText("pointMsg",pe.message,true);return;}
  const byDriver={};(points||[]).forEach(p=>byDriver[p.driver_id]=p);
  $("pointRows").innerHTML=(drivers||[]).length?(drivers||[]).map(d=>{
    const p=byDriver[d.id];
    return `<div class="point-row">
      <div class="point-driver-info"><b>#${esc(d.number||"—")}</b><strong>${esc(d.name||"—")}</strong><span>${esc(d.car||"—")}${d.team?` ／ ${esc(d.team)}`:""}</span></div>
      <input class="point-value" data-driver="${Number(d.id)}" type="number" min="0" step="1" value="${p?Number(p.points):0}" aria-label="${esc(d.name||"")} ポイント">
      <span class="point-unit">POINT</span>
    </div>`;
  }).join(""):'<p>選手がまだ登録されていません。</p>';
  setText("pointMsg","各選手のポイントを入力できます。");
}

$("savePointsBtn").onclick=async()=>{
  const eventId=Number($("pointEvent").value);
  if(!eventId)return;
  const rows=[...document.querySelectorAll(".point-value[data-driver]")].map(input=>({
    event_id:eventId,
    driver_id:Number(input.dataset.driver),
    points:input.value===""?0:Number(input.value)
  }));
  if(rows.some(r=>!Number.isInteger(r.points)||r.points<0)){
    setText("pointMsg","ポイントは0以上の整数で入力してください。",true);return;
  }
  try{
    const{error:del}=await client.from("driver_event_points").delete().eq("event_id",eventId);
    if(del)throw del;
    const{error:ins}=await client.from("driver_event_points").insert(rows);
    if(ins)throw ins;
    setText("pointMsg","全選手のポイントを保存しました ✓");
    loadPointEditor();
  }catch(e){setText("pointMsg",e.message,true);}
};

$("clearPointsBtn").onclick=async()=>{
  const eventId=Number($("pointEvent").value);if(!eventId)return;
  if(!confirm("この大会の全選手ポイントを削除しますか？"))return;
  const{error}=await client.from("driver_event_points").delete().eq("event_id",eventId);
  if(error){setText("pointMsg",error.message,true);return;}
  setText("pointMsg","この大会の全選手ポイントを削除しました ✓");loadPointEditor();
};

start();
