(() => {
const client=window.supabase.createClient(window.REFLORIA_SUPABASE_URL,window.REFLORIA_SUPABASE_KEY);
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function fmtDate(d){const x=new Date(d+"T00:00:00");return `${x.getFullYear()}.${String(x.getMonth()+1).padStart(2,"0")}.${String(x.getDate()).padStart(2,"0")}`}
async function loadUpcomingEvents(){
 const today=new Date();today.setHours(0,0,0,0);const iso=today.toISOString().slice(0,10);
 const {data,error}=await client.from("events").select("*").gte("event_date",iso).order("event_date",{ascending:true}).order("event_time",{ascending:true}).limit(3);
 const root=document.querySelector("#upcoming-events");if(!root)return;
 if(error){root.innerHTML="<p>イベント情報を読み込めませんでした。</p>";return}
 if(!data?.length){root.innerHTML="<p>次回開催予定はありません。</p>";return}
 root.innerHTML=data.map((e,i)=>`<article class="upcoming-card ${i===0?"next-event":""}"><div class="upcoming-num">${i===0?"NEXT EVENT":"EVENT "+String(i+1).padStart(2,"0")}</div><div class="upcoming-date">${fmtDate(e.event_date)} <b>${String(e.event_time).slice(0,5)}</b></div><h3>${esc(e.event_name)}</h3><p>📍 ${esc(e.event_location)}</p>${e.prize?`<span>${esc(e.prize)}</span>`:""}<div class="upcoming-tags">${e.drift_only?"<i>DRIFT ONLY</i>":""}${e.tcs_off?"<i>TCS OFF</i>":""}${e.judge_review?"<i>JUDGE</i>":""}</div></article>`).join("");
}
async function loadDrivers(){const {data}=await client.from("drivers").select("id");document.querySelectorAll("[data-drivers-count]").forEach(x=>x.textContent=data?.length||0)}
loadUpcomingEvents();loadDrivers();
})();