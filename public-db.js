const {createClient}=supabase;
const db=createClient(window.REFLORIA_SUPABASE_URL,window.REFLORIA_SUPABASE_KEY);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const weekday=["SUN","MON","TUE","WED","THU","FRI","SAT"];
function fmtDate(v){const d=new Date(v+"T00:00:00");return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")} ${weekday[d.getDay()]}`;}
async function loadRefloria(){
 const {data:event,error}=await db.from("event_settings").select("*").order("id",{ascending:false}).limit(1).maybeSingle();
 if(error){console.warn(error);return}
 if(event){
   const date=fmtDate(event.event_date), short=date.slice(5), time=(event.event_time||"").slice(0,5);
   document.querySelectorAll("[data-event-name]").forEach(x=>x.textContent=event.event_name);
   document.querySelectorAll("[data-event-date]").forEach(x=>x.textContent=date);
   document.querySelectorAll("[data-event-date-short]").forEach(x=>x.textContent=short);
   document.querySelectorAll("[data-event-time]").forEach(x=>x.textContent=time);
   document.querySelectorAll("[data-event-location]").forEach(x=>x.textContent=event.event_location);
   document.querySelectorAll("[data-event-host]").forEach(x=>x.textContent=event.host||"");
   document.querySelectorAll("[data-event-prize]").forEach(x=>x.textContent=event.prize||"");
   document.querySelectorAll("[data-event-description]").forEach(x=>x.textContent=event.description||"");
 }
 const {data:drivers}=await db.from("drivers").select("*").order("id",{ascending:true});
 const count=drivers?.length||0;
 document.querySelectorAll("[data-drivers-count]").forEach(x=>x.textContent=count);
 const grid=document.querySelector(".driver-grid");
 if(grid && drivers){
   grid.innerHTML=drivers.slice(0,8).map((d,i)=>`<article class="driver-card reveal"><div class="driver-photo photo-${String.fromCharCode(97+(i%4))}"><span>${String(i+1).padStart(2,"0")}</span></div><div class="driver-info"><small>#${String(i+1).padStart(3,"0")}</small><h3>${esc(d.name)}</h3><p>${esc(d.team||d.car||"")}</p></div></article>`).join("");
 }
}
loadRefloria();
