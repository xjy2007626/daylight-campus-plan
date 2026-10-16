/* Meal photos and a shared memo/task space. Existing planner data stays compatible. */
const dailyBaseNutrition=fitnessNutrition,dailyBaseSettings=settings,dailyBaseRender=render,dailyBaseToday=today,dailyBaseValid=validState;
let memoFilter='pending',memoSearch='',memoEditId='',photoTrash=false,photoUrls=[],dailyRenderId=0,photoBusy=false,backupBusy=false;
const PHOTO_DB='daylight-meal-photos-v1';
let photoDbPromise;
function photoDB(){
 if(!photoDbPromise)photoDbPromise=new Promise((resolve,reject)=>{
  if(!window.indexedDB){reject(Error('这个浏览器不支持照片存储'));return;}
  const r=indexedDB.open(PHOTO_DB,1);
  r.onupgradeneeded=()=>{const db=r.result;db.createObjectStore('files',{keyPath:'id'});const m=db.createObjectStore('meta',{keyPath:'id'});m.createIndex('date','date');};
  r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();photoDbPromise=null;};resolve(r.result);};
  r.onerror=()=>{photoDbPromise=null;reject(r.error||Error('照片存储暂不可用'));};
 });
 return photoDbPromise;
}
async function photoRead(store,method,key){const db=await photoDB();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly'),r=key===undefined?tx.objectStore(store)[method]():tx.objectStore(store)[method](key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function photoWrite(entries,replace=false){const db=await photoDB();return new Promise((resolve,reject)=>{const tx=db.transaction(['meta','files'],'readwrite');tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error||Error('照片写入失败'));tx.onerror=()=>{};const meta=tx.objectStore('meta'),files=tx.objectStore('files');if(replace){meta.clear();files.clear();}for(const {blob,...m} of entries){meta.put(m);if(blob)files.put({id:m.id,blob});}});}
async function photoMetaFor(date){const db=await photoDB();return new Promise((resolve,reject)=>{const r=db.transaction('meta','readonly').objectStore('meta').index('date').getAll(date);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function photoBytes(n){return n>=1024**3?(n/1024**3).toFixed(2)+' GB':n>=1024**2?(n/1024**2).toFixed(1)+' MB':Math.ceil(n/1024)+' KB';}
function photoRevoke(){photoUrls.forEach(u=>URL.revokeObjectURL(u));photoUrls=[];}
async function photoCompress(file){
 if(!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type))throw Error('请选 JPG、PNG、WebP 或 AVIF 图片；HEIC 请先转为 JPG');
 if(file.size>20*1024**2)throw Error('单张原图请小于20MB');
 let bitmap;
 try{bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});}catch{throw Error('图片无法解码，请改选 JPG 或 PNG');}
 try{
  if(bitmap.width*bitmap.height>60e6)throw Error('图片尺寸太大，请先缩小后再选');
  const scale=Math.min(1,1440/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const encode=q=>new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('图片压缩失败')),'image/jpeg',q));
  let blob=await encode(.78);if(blob.size>600*1024)blob=await encode(.55);if(blob.size>2*1024**2)throw Error('压缩后仍大于2MB，请换一张较小图片');
  return blob;
 }finally{bitmap.close();}
}
function photoSection(){return `<section class="card photo-section" id="mealPhotos"><div class="cardhead"><div><span class="eyebrow">A PICTURE OF MY MEAL</span><h2>把这一餐，留个记录。</h2></div><span class="pill">${selected}</span></div><p class="hint">拍下餐食或营养标签，稍后对照份量自己核算。照片不会自动识别热量；原图会转为压缩 JPG 保存在本浏览器。</p><form id="photoUploadForm"><div class="formrow"><label>餐次<select name="meal"><option>早餐</option><option selected>午餐</option><option>晚餐</option><option>加餐 / 标签</option></select></label><label>食物和份量（可选）<input name="caption" maxlength="600" placeholder="例如：米饭约150g，鸡腿去骨后再估算"></label></div><div class="photo-upload-actions"><label class="upload-button">＋ 选择餐食照片<input name="photos" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple></label><label class="upload-button">◎ 拍一张<input name="camera" type="file" accept="image/jpeg,image/png,image/webp" capture="environment"></label><button class="primary" type="submit" id="photoSave">保存所选照片</button></div><p id="photoPickStatus" class="hint" role="status">每批最多6张；按当前日期保存，可加份量备注。</p></form><div class="cardhead topspace"><h3>当天照片</h3><button id="photoTrashToggle" class="quiet">${photoTrash?'返回照片':'查看已归档照片'}</button></div><div id="photoGallery" class="photo-gallery" aria-live="polite">正在读取当天照片…</div><details class="photo-storage"><summary>照片能保存多久？查看容量与备份</summary><div id="photoStorageInfo" class="hint" role="status">正在查询本浏览器存储…</div><p class="hint">没有按天自动过期的设置，也没有固定保证的保存年限。照片与文字均在当前浏览器，清除网站数据、换设备或浏览器回收空间都可能影响记录。照片已归档也占空间。用含照片的完整备份迁移；普通旧版JSON不含照片。</p><div class="photo-upload-actions"><button data-full-backup>导出完整备份（含照片）↓</button><button id="photoPersist">尝试保留本地存储</button></div><p class="hint">按每天3张、每张200KB估算，一年约220MB；实际以压缩后文件为准。<a href="https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria" target="_blank" rel="noopener">浏览器存储说明 ↗</a></p></details></section>`;}
fitnessNutrition=()=>{
 let html=dailyBaseNutrition().replace('<div class="twocol">',photoSection()+'<div class="twocol">');
 const m=state.health.meals[selected]||{};
 html=html.replace('<label>今天实际吃了什么',`<div class="formrow"><label>实际碳水（g，可空）<input type="number" name="carbs" min="0" max="1500" step="0.1" value="${esc(m.carbs??'')}"></label><label>实际脂肪（g，可空）<input type="number" name="fat" min="0" max="700" step="0.1" value="${esc(m.fat??'')}"></label><label>实际热量（千卡，可空）<input type="number" name="calories" min="0" max="15000" step="1" value="${esc(m.calories??'')}"></label></div><button type="button" id="mealCalculate">由已填三大营养素计算热量</button><p id="mealCalculateStatus" class="hint" role="status">碳水×4＋蛋白质×4＋脂肪×9；需要三项都填好，结果仍是估算。</p><label>今天实际吃了什么`);
 return html;
};
function memoDone(n,date=selected){return n.repeat==='daily'?!!state.memoChecks?.[date+'|'+n.id]:!!n.completed;}
function memoAvailable(n,date=selected){return n.kind==='task'&&(!n.date||n.date<=date);}
function memoItems(){return state.notes.filter(n=>{
  if(memoFilter==='archived'&&!n.archived)return false;
  if(memoFilter!=='archived'&&n.archived)return false;
  if(memoFilter==='pending'&&(!memoAvailable(n)||memoDone(n)))return false;
  if(memoFilter==='done'&&(!memoAvailable(n)||!memoDone(n)))return false;
  return (String(n.title)+' '+(n.text||'')+' '+(n.category||'')).toLowerCase().includes(memoSearch.toLowerCase());
 }).sort((a,b)=>(a.date||'').localeCompare(b.date||''));}
function memoRows(){const ns=memoItems();return ns.length?ns.map(n=>{
 const task=n.kind==='task',complete=task&&memoDone(n),overdue=task&&n.repeat!=='daily'&&!complete&&n.date&&n.date<selected;
 return `<article class="memo-item ${complete?'memo-complete':''}"><div class="memo-item-head">${task&&!n.archived?`<input type="checkbox" data-memo-check="${esc(n.id)}" aria-label="完成备忘 ${esc(n.title)}" ${complete?'checked':''}>`:'<span class="memo-symbol">▤</span>'}<div><strong>${esc(n.title)}</strong><div class="muted">${task?(n.repeat==='daily'?'每日任务 · 从 '+esc(n.date||'未设日期')+' 开始':'任务日期 '+esc(n.date||'未设')):'便签 · '+esc(n.date||'')}${overdue?' · 之前未完成':''}${n.category?' · '+esc(n.category):''}</div></div></div>${n.text?`<p>${esc(n.text)}</p>`:''}${/^https?:\/\//.test(n.url||'')?`<a href="${esc(n.url)}" target="_blank" rel="noopener">查看链接 ↗</a>`:''}<div class="memo-actions">${n.archived?`<button data-memo-restore="${esc(n.id)}">恢复</button>`:`<button data-memo-edit="${esc(n.id)}">编辑</button>${!task?`<button data-memo-convert="${esc(n.id)}">转为待办</button>`:''}<button class="quiet" data-memo-archive="${esc(n.id)}">归档</button>`}</div></article>`;
 }).join(''):'<div class="empty">'+({pending:'当前没有未完成事项。记下下一件小事吧。',done:'这个日期还没有已完成事项。',all:'还没有记录，旧笔记也会保留在这里。',archived:'没有已归档记录。'}[memoFilter])+'</div>';}
notes=()=>{
 const n=state.notes.find(n=>n.id===memoEditId)||{},pending=state.notes.filter(n=>!n.archived&&memoAvailable(n)&&!memoDone(n)).length,completed=state.notes.filter(n=>!n.archived&&memoAvailable(n)&&memoDone(n)).length;
 return pagehead('记下来，一件一件完成。','每日任务与随手便签放在一起 · 之前的课程笔记也都保留')+`<section class="memo-summary"><div><span class="eyebrow">ONE THING AT A TIME</span><h2>${pending} 件待办，${completed} 件已完成。</h2><p>未完成事项会保留；每天重复的任务按当天独立打勾。</p></div><button data-daily-settings>数据与设置 →</button></section><div class="twocol"><section class="card" id="memoEditor"><h2>${n.id?'编辑这条备忘':'添加任务或便签'}</h2><form id="memoForm"><input name="id" type="hidden" value="${esc(n.id||'')}"><label>要记什么？<input name="title" required maxlength="100" value="${esc(n.title||'')}" placeholder="例如：晚饭后整理错题10分钟"></label><div class="formrow"><label>记录类型<select name="kind"><option value="task" ${n.kind==='task'||!n.id?'selected':''}>可勾选任务</option><option value="note" ${n.id&&n.kind!=='task'?'selected':''}>普通便签</option></select></label><label>任务 / 便签日期<input name="date" type="date" required value="${esc(n.date||selected)}"></label><label>重复<select name="repeat"><option value="once">仅这一次</option><option value="daily" ${n.repeat==='daily'?'selected':''}>每天一条打卡</option></select></label></div><label>补充内容（可选）<textarea name="text" rows="5" maxlength="10000" placeholder="细节、想法，或者下次怎么做">${esc(n.text||'')}</textarea></label><label>链接（可选）<input name="url" type="url" value="${esc(n.url||'')}" placeholder="https://..."></label><div class="photo-upload-actions"><button type="submit" class="primary">${n.id?'保存修改':'添加备忘 ＋'}</button>${n.id?'<button type="button" id="memoCancel">取消编辑</button>':''}</div></form></section><section class="card"><div class="cardhead"><h2>我的备忘录</h2><span class="pill">按所选日期查看</span></div><div class="memo-filters" aria-label="备忘录筛选">${[['pending','未完成'],['done','已完成'],['all','全部与便签'],['archived','已归档']].map(([v,t])=>`<button data-memo-filter="${v}" aria-pressed="${memoFilter===v}" class="${memoFilter===v?'primary':''}">${t}</button>`).join('')}</div><label class="memo-search">搜索备忘<input id="memoSearch" value="${esc(memoSearch)}" placeholder="标题、内容或原分类"></label><div id="memoList">${memoRows()}</div></section></div>`;
};
today=()=>dailyBaseToday()+`<section class="card"><div class="cardhead"><h2>接下来的一件小事</h2><button data-daily-memos>打开备忘录 →</button></div>${state.notes.filter(n=>!n.archived&&memoAvailable(n)&&!memoDone(n)).slice(0,4).map(n=>`<label class="memo-today"><input type="checkbox" data-memo-check="${esc(n.id)}">${esc(n.title)}</label>`).join('')||'<p class="hint">没有未完成备忘，给今天留一点余地。</p>'}</section>`;
settings=()=>dailyBaseSettings().replace('计划是为你服务的。','数据与设置。').replace('导出全部数据 ↓','导出文字数据（不含照片）↓')+`<section class="card"><h2>照片与完整备份</h2><p class="hint">餐食照片单独保存在本浏览器的照片库，普通文字备份不含照片，导入旧版文字备份不会修改照片库。需要换设备时，请使用完整备份，里面含课表、训练、饮食、备忘和照片。</p><button data-full-backup>导出完整备份（含照片）↓</button><label>导入完整备份（替换文字与照片）<input type="file" id="dailyImportFull" accept="application/json,.json"></label><p id="dailyBackupStatus" class="hint" role="status"></p><button data-daily-memos>回到备忘录 →</button></section>`;
validState=s=>dailyBaseValid(s)&&(!s.memoChecks||(typeof s.memoChecks==='object'&&!Array.isArray(s.memoChecks)))&&s.notes.every(n=>(!n.kind||['task','note'].includes(n.kind))&&(!n.repeat||['once','daily'].includes(n.repeat))&&(!n.kind||fitnessDateValid(n.date)));
async function photoRefresh(version=dailyRenderId){
 const date=selected,host=$('#photoGallery');if(!host)return;
 try{
  const all=await photoMetaFor(date),items=all.filter(m=>!!m.trashed===photoTrash).sort((a,b)=>a.created.localeCompare(b.created));
  const photos=await Promise.all(items.map(async m=>({...m,file:await photoRead('files','get',m.id)})));
  if(version!==dailyRenderId||selected!==date||!$('#photoGallery'))return;
  photoRevoke();
  host.innerHTML=photos.length?photos.map(m=>{
   const url=m.file?.blob?URL.createObjectURL(m.file.blob):'';if(url)photoUrls.push(url);
   return `<article class="photo-card">${url?`<a href="${url}" target="_blank" rel="noopener" aria-label="查看餐食照片 ${esc(m.meal)}"><img src="${url}" alt="${esc(m.meal+'：'+(m.caption||'餐食照片'))}" loading="lazy"></a>`:'<p class="hint">这张照片文件缺失，请从备份恢复。</p>'}<form data-photo-meta="${esc(m.id)}"><label>餐次<select name="meal">${['早餐','午餐','晚餐','加餐 / 标签'].map(x=>`<option ${m.meal===x?'selected':''}>${x}</option>`).join('')}</select></label><label>食物和份量备注<input name="caption" maxlength="600" value="${esc(m.caption||'')}"></label><div class="photo-card-actions"><button type="submit">保存备注</button><button type="button" data-photo-download="${esc(m.id)}">下载</button><button type="button" data-photo-archive="${esc(m.id)}">${m.trashed?'恢复':'归档'}</button></div></form><p class="hint">${photoBytes(m.bytes)} · 压缩 JPG</p></article>`;
  }).join(''):`<div class="empty">${photoTrash?'当天没有已归档照片。':'当天还没有照片，拍下或选择这一餐吧。'}</div>`;
  host.querySelectorAll('[data-photo-meta]').forEach(f=>f.onsubmit=async e=>{e.preventDefault();try{const m=all.find(x=>x.id===f.dataset.photoMeta),v=Object.fromEntries(new FormData(f));await photoWrite([{...m,meal:v.meal,caption:v.caption}]);toast('照片备注已保存');}catch{toast('备注保存失败，请重试');}});
  host.querySelectorAll('[data-photo-archive]').forEach(b=>b.onclick=async()=>{if(b.disabled)return;b.disabled=true;try{const m=all.find(x=>x.id===b.dataset.photoArchive);await photoWrite([{...m,trashed:!m.trashed}]);await photoRefresh();}catch{toast('照片更新失败，请重试');b.disabled=false;}});
  host.querySelectorAll('[data-photo-download]').forEach(b=>b.onclick=async()=>{try{const f=await photoRead('files','get',b.dataset.photoDownload);if(!f?.blob)throw Error();const url=URL.createObjectURL(f.blob),a=document.createElement('a');a.href=url;a.download='餐食-'+date+'-'+b.dataset.photoDownload.slice(0,8)+'.jpg';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}catch{toast('照片暂时无法下载');}});
  await photoStorage(version);
 }catch(e){if(version===dailyRenderId&&$('#photoGallery'))host.innerHTML='<div class="notice">照片库暂时无法打开，请检查浏览器存储权限。文字记录仍可使用。</div>';}
}
async function photoStorage(version=dailyRenderId){
 try{
  const all=await photoRead('meta','getAll'),bytes=all.reduce((s,m)=>s+m.bytes,0),estimate=await navigator.storage?.estimate?.(),persisted=await navigator.storage?.persisted?.();
  if(version!==dailyRenderId||!$('#photoStorageInfo'))return;
  const avg=all.length?bytes/all.length:200*1024,remaining=estimate?.quota?Math.max(0,estimate.quota-(estimate.usage||0)):null,days=remaining===null?null:Math.floor(remaining/(avg*3));
  $('#photoStorageInfo').textContent=`照片库 ${all.length} 张，占 ${photoBytes(bytes)}。${estimate?.quota?'本网站所有存储约用 '+photoBytes(estimate.usage||0)+'，浏览器估计配额 '+photoBytes(estimate.quota)+'。':'浏览器未提供容量估计。'}${days!==null?'按每天3张、'+(all.length?'当前平均':'假设每张')+photoBytes(avg)+'，理论剩余约 '+days+' 天；配额会变，不是保存承诺。':''} ${persisted?'已获持久存储保护，仍需备份。':'尚未获持久存储保护。'}`;
 }catch{if($('#photoStorageInfo'))$('#photoStorageInfo').textContent='暂时无法估算容量，请先导出完整备份。';}
}
function dailyMemoSave(form){const v=Object.fromEntries(new FormData(form));if(!v.title.trim()||!fitnessDateValid(v.date)||v.url&&!/^https?:\/\//.test(v.url)){toast('请检查标题、日期和链接');return;}const old=state.notes.find(n=>n.id===v.id),n={...old,...v,id:old?.id||uid(),title:v.title.trim(),kind:v.kind,repeat:v.kind==='task'?v.repeat:'once',category:old?.category||'',completed:old?.completed||false};if(old)state.notes[state.notes.indexOf(old)]=n;else state.notes.unshift(n);memoEditId='';memoFilter=v.kind==='note'?'all':'pending';save();render();toast('备忘已保存');}
function dailyMemoBind(){
 app.querySelectorAll('[data-memo-check]').forEach(c=>c.onchange=()=>{const n=state.notes.find(n=>n.id===c.dataset.memoCheck);if(!n)return;if(n.repeat==='daily'){state.memoChecks??={};state.memoChecks[selected+'|'+n.id]=c.checked;}else n.completed=c.checked;save();render();});
 app.querySelectorAll('[data-memo-filter]').forEach(b=>b.onclick=()=>{memoFilter=b.dataset.memoFilter;render();});
 app.querySelectorAll('[data-memo-edit]').forEach(b=>b.onclick=()=>{memoEditId=b.dataset.memoEdit;render();$('#memoEditor')?.scrollIntoView({behavior:'smooth'});});
 app.querySelectorAll('[data-memo-archive],[data-memo-restore]').forEach(b=>b.onclick=()=>{const n=state.notes.find(n=>n.id===(b.dataset.memoArchive||b.dataset.memoRestore));if(n){n.archived=!!b.dataset.memoArchive;save();render();}});
 app.querySelectorAll('[data-memo-convert]').forEach(b=>b.onclick=()=>{const n=state.notes.find(n=>n.id===b.dataset.memoConvert);if(n){n.kind='task';n.repeat='once';n.date=selected;n.completed=false;save();render();}});
 if($('#memoSearch'))$('#memoSearch').oninput=e=>{memoSearch=e.target.value;$('#memoList').innerHTML=memoRows();dailyMemoBind();};
 if($('#memoForm'))$('#memoForm').onsubmit=e=>{e.preventDefault();dailyMemoSave(e.target);};
 if($('#memoCancel'))$('#memoCancel').onclick=()=>{memoEditId='';render();};
}
async function dailyExport(){
 if(backupBusy){toast('备份处理中，请稍候');return;}if(photoBusy){toast('照片保存中，完成后再导出');return;}backupBusy=true;
 try{toast('正在打包文字与照片，请稍候');const snapshot=structuredClone(state),all=await photoRead('meta','getAll'),photos=[];for(const m of all){const f=await photoRead('files','get',m.id);if(!f?.blob)throw Error('有照片文件缺失，未导出不完整备份');const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('照片读取失败'));r.readAsDataURL(f.blob);});photos.push({...m,data});}fitnessDownload(JSON.stringify({format:'daylight-full-v1',exportedAt:new Date().toISOString(),state:snapshot,photos}),'日常有序-含照片完整备份-'+localDate()+'.json');toast('完整备份已生成，共 '+photos.length+' 张照片');}catch(e){toast(e.message||'完整备份失败，原记录未修改');}finally{backupBusy=false;}
}
async function dailyParseBackup(file){
 const d=JSON.parse(await file.text());if(d.format!=='daylight-full-v1'||!validState(d.state)||!Array.isArray(d.photos))throw Error('不是有效的完整备份');
 const ids=new Set(),entries=[];
 for(const m of d.photos){if(!m||typeof m.id!=='string'||!m.id||ids.has(m.id)||!fitnessDateValid(m.date)||!['早餐','午餐','晚餐','加餐 / 标签'].includes(m.meal)||typeof m.caption!=='string'||m.caption.length>600||typeof m.created!=='string'||!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(m.data)||m.data.length>3*1024**2)throw Error('照片备份格式不正确');ids.add(m.id);const raw=atob(m.data.split(',')[1]),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));if(bytes.length<4||bytes[0]!==255||bytes[1]!==216)throw Error('照片文件无效');entries.push({id:m.id,date:m.date,meal:m.meal,caption:m.caption,created:m.created,trashed:!!m.trashed,bytes:bytes.length,blob:new Blob([bytes],{type:'image/jpeg'})});}
 return {state:d.state,entries};
}
async function dailyImport(file){
 if(backupBusy||photoBusy){toast('请等当前保存或备份完成');return;}backupBusy=true;
 try{
  const incoming=await dailyParseBackup(file);
  if(!confirm('这会替换当前浏览器的文字记录与全部餐食照片。请确认已有备份，再继续导入。'))return;
  const oldState=JSON.stringify(state),nextState=JSON.stringify(incoming.state);
  // Commit photo replacement atomically. Keep the synchronous text write in the same task;
  // on photo failure restore text, while IndexedDB abort preserves the old photo stores.
  localStorage.setItem(KEY,nextState);
  try{await photoWrite(incoming.entries,true);}catch(e){localStorage.setItem(KEY,oldState);throw e;}
  state=incoming.state;render();toast('完整备份已恢复，含 '+incoming.entries.length+' 张照片');
 }catch(e){toast(e.message||'导入失败，请检查备份文件');}finally{backupBusy=false;}
}
function dailyBind(){
 dailyMemoBind();
 app.querySelectorAll('[data-daily-memos]').forEach(b=>b.onclick=()=>navigate('notes'));
 app.querySelectorAll('[data-daily-settings]').forEach(b=>b.onclick=()=>navigate('settings'));
 app.querySelectorAll('[data-full-backup]').forEach(b=>b.onclick=dailyExport);
 if($('#dailyImportFull'))$('#dailyImportFull').onchange=e=>{if(e.target.files[0])dailyImport(e.target.files[0]);};
 if($('#mealCalculate'))$('#mealCalculate').onclick=()=>{const f=$('#fitnessMealForm'),v=Object.fromEntries(new FormData(f));if(!['carbs','protein','fat'].every(k=>fitnessNumber(v[k],0,k==='carbs'?1500:k==='fat'?700:500))){$('#mealCalculateStatus').textContent='请先填写实际碳水、蛋白质、脂肪；没有数据的项目不要用目标值代替。';return;}f.elements.calories.value=Math.round(+v.carbs*4+ +v.protein*4+ +v.fat*9);$('#mealCalculateStatus').textContent='已计算估算热量，点击“保存当天饮食”保存。';};
 const upload=$('#photoUploadForm');
 if(upload){
  upload.onchange=()=>{const count=upload.elements.photos.files.length+upload.elements.camera.files.length;$('#photoPickStatus').textContent='已选 '+count+' 张，点击保存后压缩并存入 '+selected+'。';};
  upload.onsubmit=async e=>{e.preventDefault();if(photoBusy||backupBusy){toast('有保存或备份正在进行，请稍候');return;}const files=[...upload.elements.photos.files,...upload.elements.camera.files];if(!files.length||files.length>6){toast('请每批选择1–6张照片');return;}photoBusy=true;const button=$('#photoSave'),date=selected,meal=upload.elements.meal.value,caption=upload.elements.caption.value;button.disabled=true;
   try{const entries=[];for(let i=0;i<files.length;i++){if($('#photoPickStatus'))$('#photoPickStatus').textContent='压缩中 '+(i+1)+' / '+files.length;const blob=await photoCompress(files[i]);entries.push({id:uid(),date,meal,caption,created:new Date().toISOString(),bytes:blob.size,blob,trashed:false});}await photoWrite(entries);upload.reset();toast(date+' 已保存 '+entries.length+' 张照片');if(date===selected)await photoRefresh();}catch(e){toast(e.name==='QuotaExceededError'?'空间不足，本批照片未保存。请先导出备份或释放设备空间。':e.message||'照片未保存，请重试');}finally{photoBusy=false;button.disabled=false;if($('#photoPickStatus'))$('#photoPickStatus').textContent='每批最多6张；保存成功的照片显示在下方。';}
  };
 }
 if($('#photoTrashToggle'))$('#photoTrashToggle').onclick=()=>{photoTrash=!photoTrash;render();};
 if($('#photoPersist'))$('#photoPersist').onclick=async()=>{try{const ok=await navigator.storage?.persist?.();toast(ok?'已获持久存储保护，请继续定期备份':'浏览器未授予持久存储，照片仍可使用，请定期备份');await photoStorage();}catch{toast('当前浏览器不支持此操作，请用完整备份保留照片');}};
}
render=()=>{dailyRenderId++;photoRevoke();dailyBaseRender();if(page==='notes')$('#breadcrumb').textContent='我的日课 / 备忘录';if(page==='settings')$('#breadcrumb').textContent='我的日课 / 数据与设置';dailyBind();if(page==='nutrition')photoRefresh();};
const dailyNotesNav=document.querySelector('[data-page="notes"]');if(dailyNotesNav)dailyNotesNav.innerHTML='▤ <span>备忘录</span>';
const dailySettingsNav=document.querySelector('nav [data-page="settings"]');if(dailySettingsNav)dailySettingsNav.remove();
$('#export').textContent='完整备份 ↓';$('#export').onclick=dailyExport;
render();
