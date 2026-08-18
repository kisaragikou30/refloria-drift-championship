const refloriaDb = supabase.createClient(window.REFLORIA_SUPABASE_URL, window.REFLORIA_SUPABASE_KEY);

function esc(v){
  return String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function formatDate(dateStr){
  const d = new Date(dateStr + 'T00:00:00');
  const wd = ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()];
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${wd}`;
}
function formatShort(dateStr){
  const d = new Date(dateStr + 'T00:00:00');
  const wd = ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()];
  return `${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${wd}`;
}
function eventTags(e){
  const a=[];
  if(e.drift_only) a.push('DRIFT ONLY');
  if(e.tcs_off) a.push('TCS OFF');
  if(e.non_custom) a.push('NON CUSTOM');
  if(e.judge_review) a.push('JUDGE REVIEW');
  return a;
}
async function loadRefloriaEvents(){
  const {data,error}=await refloriaDb.from('events')
    .select('*').gte('event_date',new Date().toISOString().slice(0,10))
    .order('event_date',{ascending:true}).limit(3);
  if(error){ console.error(error); return []; }
  return data || [];
}
