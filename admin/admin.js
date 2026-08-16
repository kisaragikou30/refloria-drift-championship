
const KEY="refloria_admin_data_v1";
const defaults={
 event:{name:"高額賞金イベント",date:"2026-08-29",time:"22:00",location:"170番地地下",host:"RedStone",prize:"高額賞金",description:"次回開催のドリフトイベント。単走・追走を審査員が審査する形式。",driftOnly:true,tcsOff:true,nonCustom:false,judge:true},
 drivers:[]
};
let data=JSON.parse(localStorage.getItem(KEY)||"null")||defaults;
const $=id=>document.getElementById(id);
function save(){localStorage.setItem(KEY,JSON.stringify(data));}
function loadEvent(){
 const e=data.event;
 $("eventName").value=e.name;$("eventDate").value=e.date;$("eventTime").value=e.time;$("eventLocation").value=e.location;
 $("eventHost").value=e.host||"";$("eventPrize").value=e.prize||"";$("eventDescription").value=e.description||"";
 $("driftOnly").checked=!!e.driftOnly;$("tcsOff").checked=!!e.tcsOff;$("nonCustom").checked=!!e.nonCustom;$("judge").checked=!!e.judge;
}
function renderDrivers(){
 $("driverList").innerHTML=data.drivers.length?data.drivers.map((d,i)=>`<div class="driver-row"><b>${esc(d.name)}</b><span>${esc(d.car||"—")}</span><span>${esc(d.team||"—")}</span><button class="delete" onclick="removeDriver(${i})">削除</button></div>`).join(""):"<p style='color:#777e8d'>まだ選手が登録されていません。</p>";
}
function renderPreview(){
 const e=data.event;
 const tags=[];if(e.driftOnly)tags.push("ドリフト車限定");if(e.tcsOff)tags.push("TCS OFF推奨");if(e.nonCustom)tags.push("ノンカスのみ");if(e.judge)tags.push("審査員審査");
 const d=new Date(e.date+"T00:00:00");const date=isNaN(d)?e.date:`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
 $("previewBox").innerHTML=`<div class="preview-label">NEXT EVENT</div><strong>${esc(e.name)}</strong><br><b>${date} / ${esc(e.time)}</b><br>📍 ${esc(e.location)}${e.host?`<br>主催：${esc(e.host)}`:""}${e.prize?`<br>🏆 ${esc(e.prize)}`:""}<div class="preview-tags">${tags.map(t=>`<span>${t}</span>`).join("")}</div>`;
}
$("eventForm").addEventListener("submit",ev=>{ev.preventDefault();data.event={name:$("eventName").value,date:$("eventDate").value,time:$("eventTime").value,location:$("eventLocation").value,host:$("eventHost").value,prize:$("eventPrize").value,description:$("eventDescription").value,driftOnly:$("driftOnly").checked,tcsOff:$("tcsOff").checked,nonCustom:$("nonCustom").checked,judge:$("judge").checked};save();renderPreview();$("eventSaved").style.display="inline";setTimeout(()=>$("eventSaved").style.display="none",1800)});
$("driverForm").addEventListener("submit",ev=>{ev.preventDefault();data.drivers.push({name:$("driverName").value,car:$("driverCar").value,team:$("driverTeam").value});save();ev.target.reset();renderDrivers();renderPreview()});
function removeDriver(i){data.drivers.splice(i,1);save();renderDrivers();}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));btn.classList.add("active");$(btn.dataset.tab).classList.add("active")}));
$("openSite").addEventListener("click",()=>window.open("../event.html","_blank"));
loadEvent();renderDrivers();renderPreview();
