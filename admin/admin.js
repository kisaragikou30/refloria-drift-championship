const {createClient}=supabase;
const client=createClient(window.REFLORIA_SUPABASE_URL,window.REFLORIA_SUPABASE_KEY);
const $=id=>document.getElementById(id);

async function init(){
 if(window.REFLORIA_SUPABASE_URL.includes("YOUR_")) {
  $("loginMsg").textContent="supabase-config.js に接続情報を入れてください。"; return;
 }
 const {data:{session}}=await client.auth.getSession();
 if(session) showApp(); else $("login").hidden=false;
}
async function login(){
 const {error}=await client.auth.signInWithPassword({email:$("email").value,password:$("password").value});
 $("loginMsg").textContent=error?error.message:"ログインしました。";
 if(!error) showApp();
}
function showApp(){ $("login").hidden=true;$("app").hidden=false;$("logout").hidden=false;loadEvent();loadDrivers(); }
$("loginBtn").onclick=login;
$("logout").onclick=async()=>{await client.auth.signOut();location.reload();};

async function loadEvent(){
 const {data,error}=await client.from("event_settings").select("*").order("id",{ascending:false}).limit(1).maybeSingle();
 if(error){$("saveMsg").textContent=error.message;return}
 if(!data)return;
 $("eventName").value=data.event_name;$("eventDate").value=data.event_date;$("eventTime").value=data.event_time?.slice(0,5)||"";
 $("eventLocation").value=data.event_location;$("eventHost").value=data.host||"";$("eventPrize").value=data.prize||"";
 $("eventDescription").value=data.description||"";$("driftOnly").checked=data.drift_only;$("tcsOff").checked=data.tcs_off;
 $("nonCustom").checked=data.non_custom;$("judgeReview").checked=data.judge_review;
}
$("eventForm").onsubmit=async e=>{
 e.preventDefault();
 const {data:old}=await client.from("event_settings").select("id").order("id",{ascending:false}).limit(1).maybeSingle();
 const payload={event_name:$("eventName").value,event_date:$("eventDate").value,event_time:$("eventTime").value,event_location:$("eventLocation").value,host:$("eventHost").value,prize:$("eventPrize").value,description:$("eventDescription").value,drift_only:$("driftOnly").checked,tcs_off:$("tcsOff").checked,non_custom:$("nonCustom").checked,judge_review:$("judgeReview").checked,updated_at:new Date().toISOString()};
 const q=old?client.from("event_settings").update(payload).eq("id",old.id):client.from("event_settings").insert(payload);
 const {error}=await q;$("saveMsg").textContent=error?error.message:"保存しました ✓";if(!error)loadEvent();
};

async function loadDrivers(){
 const {data,error}=await client.from("drivers").select("*").order("id",{ascending:true});
 if(error){$("driverList").textContent=error.message;return}
 $("driverList").innerHTML=data.map(d=>`<div class="driver"><b>${esc(d.name)}</b><span>${esc(d.car||"—")}</span><span>${esc(d.team||"—")}</span><button onclick="delDriver(${d.id})">削除</button></div>`).join("")||"<p>選手がまだいません。</p>";
}
$("driverForm").onsubmit=async e=>{
 e.preventDefault(); const {error}=await client.from("drivers").insert({name:$("driverName").value,car:$("driverCar").value,team:$("driverTeam").value});
 if(!error){e.target.reset();loadDrivers()}else alert(error.message);
};
async function delDriver(id){if(confirm("この選手を削除しますか？")){await client.from("drivers").delete().eq("id",id);loadDrivers()}}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("eventPage").hidden=b.dataset.page!=="event";$("driversPage").hidden=b.dataset.page!=="drivers"});
init();
