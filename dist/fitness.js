/* Extends the original planner without replacing its storage key or user records. */
const fitnessLegacyDefaults = defaults;
const fitnessBaseValidState = validState;
const fitnessBaseToday = today;
const fitnessBaseWeek = week;
const fitnessBaseSettings = settings;
const fitnessBaseRender = render;
const FITNESS_REVISION = 2;
const FITNESS_BACKUP_KEY = KEY + '-before-fitness-v2';
const fitnessWorkouts = [
 {id:'push',name:'推 · 胸肩三头与腹部',day:2,time:'周二 12:00–12:50',rows:[
  ['器械推胸 / 哑铃卧推','2 × 8–12','选一种，控制下降，躯干和手腕稳定。'],
  ['上斜哑铃卧推','2 × 8–12','前两周可只做1组，先用能控制的重量。'],
  ['哑铃侧平举','2 × 12–15','不甩腰，使用舒适幅度。'],
  ['绳索三头下压','2 × 10–15','身体稳定，避免用全身压重量。'],
  ['绳索卷腹','2 × 10–15','腹部主动卷曲，不只是髋部前后摆。'],
  ['死虫','2 × 每侧6–8','保持躯干稳定，自然呼吸。']
 ]},
 {id:'pull',name:'拉 · 背后束二头与核心',day:4,time:'周四 12:00–12:50',rows:[
  ['对握高位下拉','2 × 8–12','身体稳定，不大幅后仰甩动。'],
  ['坐姿绳索 / 胸托划船','2 × 8–12','选一种，用背部控制，避免甩腰。'],
  ['反向蝴蝶机','2 × 12–15','轻重量，躯干保持稳定。'],
  ['哑铃 / 绳索弯举','2 × 10–15','上臂相对稳定，控制还原。'],
  ['Pallof抗旋转推压','2 × 每侧8–10','轻拉力，推出时身体不跟着转。']
 ]},
 {id:'legs',name:'腿 · 弹跳、单腿力量与核心',day:6,time:'周六 12:00–13:00',rows:[
  ['小幅起跳后落地停稳','2 × 3','落地停约2秒，每次重新准备。'],
  ['原地摆臂纵跳','2 × 3','热身后、力量前练；不连续猛跳或追最高。'],
  ['高脚杯深蹲 / 腿举','2 × 8–12','选一种，在稳定可控的幅度内做。'],
  ['保加利亚分腿蹲','2 × 每侧6–8','先自重扶支撑；不稳先做后脚留地的分腿蹲。'],
  ['哑铃罗马尼亚硬拉','2 × 8–10','先学髋向后折叠，不以碰地为目标。'],
  ['腿弯举','1–2 × 10–15','时间紧或疲劳时优先减少这一辅助项。'],
  ['提踵','2 × 12–15','控制下降，不快速弹起。'],
  ['侧平板','2 × 每侧15–25秒','躯干保持直线，难时可屈膝退阶。']
 ]}
];

function fitnessHealthDefaults(){return {
 profile:{age:19,height:190,weight:93,protein:150,carbs:250,fat:90,budget:30,startDate:'2026-10-15',interval:10},
 reviews:[],meals:{},exercises:{}
};}
function fitnessSameEvent(a,b){return ['id','day','start','end','title','type','note','repeat'].every(k=>a[k]===b[k]);}
function fitnessManagedLegacy(e){return ['午餐与放松','午休 / 闭目休息','英语 · 单词与听力','抗阻 A · 胸背与全身','抗阻 B · 胸背与全身'].includes(e.title)||(e.day===6&&e.title==='高数 · 当天一组题');}
function fitnessPlanEvents(){
 const events=[];
 const add=(id,day,start,end,title,type,note='')=>events.push({id:'fitness-v2-'+id,day,start,end,title,type,note,repeat:'weekly'});
 for(let d=0;d<7;d++){
  if([2,4,6].includes(d)){
   const w=fitnessWorkouts.find(x=>x.day===d),leg=d===6;
   add('gym-'+d,d,'12:00',leg?'13:00':'12:50',w.name,'gym','含6–8分钟热身。前两周低组数，保留2–3次余力；详细动作见训练页。');
   add('lunch-'+d,d,leg?'13:05':'12:55',leg?'13:25':'13:15','练后午餐与补水','rest','两只鸡腿、青菜与主食，15–17元；是否含米饭请按实际记账。无需另买一套练后餐。');
   add('english-'+d,d,leg?'13:30':'13:20','13:50','英语 · 单词与听力','study',leg?'先学20分钟，晚间学习块中再补10分钟；13:50后预留去课堂的时间。':'单词与听力各15分钟，13:50后预留去课堂的时间。');
  }else{
   add('lunch-'+d,d,'11:40','12:20','午餐与放松','rest');
   add('rest-'+d,d,'12:20','12:40','午休 / 闭目休息','rest');
   add('english-'+d,d,'12:40','13:10','英语 · 单词与听力','study','单词与听力各15分钟。');
  }
 }
 add('math-saturday',6,'16:00','16:40','高数 · 当天一组题','study','午间改为腿部训练，原13:10学习块移到这里；晚间保留原巩固块。');
 return events;
}
function fitnessUpgrade(input){
 const s=structuredClone(input);
 if(s.fitnessRevision===FITNESS_REVISION){
  s.health??=fitnessHealthDefaults();
  return s;
 }
 const legacy=fitnessLegacyDefaults().events,oldById=new Map(legacy.map(e=>[e.id,e]));
 const keptCustom=[];
 s.events=s.events.filter(e=>{
  const old=oldById.get(e.id);
  if(!old||!fitnessManagedLegacy(old))return true;
  if(fitnessSameEvent(e,old))return false;
  keptCustom.push(e.title);return true;
 });
 const existing=new Set(s.events.map(e=>e.id));
 for(const e of fitnessPlanEvents())if(!existing.has(e.id))s.events.push(e);
 s.health??=fitnessHealthDefaults();
 s.fitnessRevision=FITNESS_REVISION;
 s.fitnessMigration={customKept:keptCustom,notice:true};
 return s;
}
defaults=()=>fitnessUpgrade(fitnessLegacyDefaults());
function fitnessDateValid(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00+08:00');return !Number.isNaN(+d)&&localDate(d)===s;}
function fitnessNumber(v,min,max){return v!==''&&v!==null&&v!==undefined&&Number.isFinite(Number(v))&&Number(v)>=min&&Number(v)<=max;}
validState=s=>fitnessBaseValidState(s)&&(!s.health||(
 s.health.profile&&fitnessNumber(s.health.profile.weight,30,300)&&fitnessNumber(s.health.profile.protein,30,400)&&fitnessNumber(s.health.profile.carbs,0,1000)&&fitnessNumber(s.health.profile.fat,0,500)&&fitnessNumber(s.health.profile.budget,1,1000)&&fitnessDateValid(s.health.profile.startDate)&&Number.isInteger(s.health.profile.interval)&&s.health.profile.interval>=1&&s.health.profile.interval<=60&&
 Array.isArray(s.health.reviews)&&s.health.reviews.every(r=>r&&fitnessDateValid(r.date)&&fitnessNumber(r.weight,30,300)&&(r.waist===''||r.waist===undefined||fitnessNumber(r.waist,30,250)))&&
 s.health.meals&&typeof s.health.meals==='object'&&!Array.isArray(s.health.meals)&&s.health.exercises&&typeof s.health.exercises==='object'&&!Array.isArray(s.health.exercises)
));
const fitnessWasOld=state.fitnessRevision!==FITNESS_REVISION;
if(fitnessWasOld){
 try{if(!localStorage.getItem(FITNESS_BACKUP_KEY))localStorage.setItem(FITNESS_BACKUP_KEY,JSON.stringify(state));}catch{}
 state=fitnessUpgrade(state);save();
}

function fitnessReviewOrder(){return [...state.health.reviews].sort((a,b)=>a.date.localeCompare(b.date));}
function fitnessDue(){const rs=fitnessReviewOrder();return shift(rs.length?rs.at(-1).date:state.health.profile.startDate,state.health.profile.interval);}
function fitnessDays(a,b){return Math.round((new Date(b+'T12:00:00+08:00')-new Date(a+'T12:00:00+08:00'))/86400000);}
function fitnessSuggestedProtein(weight){return Math.round(Number(weight)*1.6/5)*5;}
function fitnessDueText(){const due=fitnessDue(),gap=fitnessDays(localDate(),due);return gap===0?'今天复盘':gap<0?'复盘已到期 '+Math.abs(gap)+' 天':'下次 '+due+' · 还有'+gap+'天';}
const fitnessBaseEventsFor=eventsFor;
eventsFor=date=>{
 const es=fitnessBaseEventsFor(date),due=fitnessDue();
 if(date===due||(date===localDate()&&date>due)){
  const wake=es.find(e=>e.title==='起床、早餐与准备'&&e.start==='07:00'&&e.end==='07:40');
  if(wake){const i=es.indexOf(wake);es[i]={...wake,start:'07:10'};}
  es.push({id:'review-'+date,date,day:dayOf(date),start:'07:00',end:'07:10',repeat:'once',type:'rest',title:'体重与饮食 · 10天复盘',note:'尽量晨起如厕后、进食前测量；在饮食与复盘页记录。先看趋势与恢复，不自动削减餐量。',fitnessReview:true});
 }
 return es.sort((a,b)=>a.start.localeCompare(b.start));
};
const fitnessBaseDone=done;
done=(e,date=selected)=>e.fitnessReview?state.health.reviews.some(r=>r.date===date):fitnessBaseDone(e,date);

function fitnessReviewBanner(){return `<section class="review-banner"><div><span class="eyebrow">EVERY 10 DAYS</span><h3>${esc(fitnessDueText())}</h3><p>同条件记录体重、腰围和训练状态，检查蛋白质摄入。</p></div><button data-open-nutrition>记录 / 查看复盘 →</button></section>`;}
today=()=>{
 const w=fitnessWorkouts.find(x=>x.day===dayOf(selected));
 let html=fitnessBaseToday()
  .replace('今天有全身抗阻训练，胸、背、核心是重点。晚间3公里轻松跑，状态差时先减训练量。',`今天中午${w?esc(w.name):'按日程训练'}，之后吃午饭。晚间3公里轻松跑，状态差时减少训练量。`)
  .replace('<div class="value">全身<small>50分钟</small></div>',`<div class="value">${w?esc(w.id==='push'?'推':w.id==='pull'?'拉':'腿与弹跳'):'训练'}<small>${w?.id==='legs'?'60':'50'}分钟</small></div>`)
  .replace('两次抗阻','中午三分化')
  .replace('周四 A → 周六 B，间隔约48小时。周一体育课也是运动负荷，第一阶段不再加第三次力量课。','周二推 → 周四拉 → 周六腿与弹跳。周一体育课也计入负荷，其他中午留给学习和恢复。');
 return html+fitnessReviewBanner();
};
week=()=>fitnessBaseWeek()
 .replace('周四、周六安排抗阻，其余天不加力量训练。','周二、周四、周六中午三分化，练后午饭；英语移到饭后，周六高数移到16:00。')
 .replace('满课：午间60分钟 + 晚间30分钟。','满课：按课表保留短学习块。周六午间英语20分钟＋下午高数40分钟＋晚间30分钟。');

function fitnessWorkoutCard(w){
 const leg=w.id==='legs';
 return `<section class="card ${leg?'wide':''}"><div class="cardhead"><h2>${esc(w.name)}</h2><span class="pill">${w.time}</span></div>
 <p class="hint">先热身6–8分钟及主项轻重量预备组；下表是正式组。${leg?'先落地和跳跃，再做力量，最后核心。':'每组保留约2–3次余力。'}</p>
 <div class="table-scroll"><table class="fitness-table"><thead><tr><th>完成</th><th>动作</th><th>组 × 次数</th><th>怎么做</th></tr></thead><tbody>${w.rows.map((r,i)=>{
 const id=w.id+'-'+i,key=selected+'|'+id;
 return `<tr><td><input type="checkbox" data-fitness-exercise="${id}" aria-label="完成动作 ${esc(r[0])}" ${state.health.exercises[key]?'checked':''}></td><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`;
 }).join('')}</tbody></table></div>
 <p class="hint">主项休息90–150秒；辅助和核心60–90秒。${leg?'跳跃组间约2分钟，每次重新站稳。前两周约12次起跳落地，不叠加大量摸框。':'训练记录可以写在下方，填写重量、次数与体感。'}</p>
 ${leg?'<div class="notice">前4周不加高台深度跳、负重跳或每天最大助跑跳。第3–4周恢复良好，可把原地纵跳改成3组×3次；动作散、跳高下降或关节痛时结束跳跃。</div>':''}</section>`;
}
training=()=>pagehead('三分化，练得扎实也跳得更稳。','19岁 · 190cm · 初始参考93kg · 目前按能摸框安排 · 先执行4周')+
 `<section class="hero"><div><div class="eyebrow">NOON TRAINING · AFTER-TRAINING LUNCH</div><h2>周二推，周四拉，周六腿与弹跳。</h2><p>中午约两小时用于训练、吃饭和去上课。其余中午留给恢复与学习；每天有空不等于每天高强度训练。</p></div></section>
 <div class="twocol">${fitnessWorkouts.map(fitnessWorkoutCard).join('')}</div>
 <div class="twocol"><section class="card"><h2>4周进阶，不急着加量</h2><ol class="rules"><li>前2周先学动作，用上述低组数；上斜推胸或卷腹可只做1组。</li><li>第3–4周恢复稳定，在推胸、下拉、划船或深蹲中挑1–2项加到3组。</li><li>连续两次规范做到次数上限、仍有约2次余力，再加最小档重量。</li><li>保加利亚蹲先自重扶支撑，做不稳退回普通分腿蹲；不要同时猛加重量、组数和跳跃。</li></ol></section>
 <section class="card"><h2>校园跑与核心</h2><p class="hint">核心已经分布到三天，不再每天补很多卷腹。20:50校园跑放慢到能轻松说话的程度，腿日不追配速；体育课也算运动负荷。</p><p class="hint">动作疲劳、睡眠或恢复明显变差，先减组。关节痛或步态异常时不硬凑跑量，与学校沟通调整。</p><a href="plan.md" download="三分化与饮食计划.md">下载完整动作与饮食说明 ↓</a></section>
 <section class="card"><h2>实际训练记录</h2>${logForm()}</section>
 <section class="card"><h2>来源与适用范围</h2><p class="hint">参考谭成义与凯圣王系列的推、拉、腿结构。完整原视频字幕尚未核实，具体动作组次、弹跳和核心是为你定制的适应版，不标作本人原话。当前每部位主练每周1次，先看适应再评估频率。</p>
 <a class="source" href="https://www.bilibili.com/video/BV17ooLBUEqS/" target="_blank" rel="noopener">三分化合作系列 ↗</a><a class="source" href="https://acsm.org/resistance-training-guidelines-update-2026/" target="_blank" rel="noopener">ACSM抗阻训练依据 ↗</a><a class="source" href="https://www.nsca.com/education/videos/plyometric-implementation-setup-and-execution-of-jump-landing-positions-to-decrease-likelihood-of-injuries/" target="_blank" rel="noopener">NSCA落地与跳跃进阶 ↗</a></section></div>`;

function fitnessMoney(v){return Number(v).toFixed(1).replace(/\.0$/,'');}
function fitnessMealSummary(m){
 const fields=['breakfastCost','lunchCost','dinnerCost'],entered=fields.filter(k=>fitnessNumber(m[k],0,1000));
 const sum=entered.reduce((n,k)=>n+Number(m[k]),0),complete=entered.length===3;
 const remainder=fitnessNumber(m.breakfastCost,0,1000)&&fitnessNumber(m.lunchCost,0,1000)?state.health.profile.budget-Number(m.breakfastCost)-Number(m.lunchCost):null;
 return {sum,complete,remainder};
}
function fitnessBudgetStatus(m){const b=fitnessMealSummary(m);return `<div class="budget-result"><strong>${b.complete?'全天合计':'已记录'} ${fitnessMoney(b.sum)} / ${state.health.profile.budget} 元</strong><span>${b.complete?(b.sum<=state.health.profile.budget?'在预算内':'超出预算 '+fitnessMoney(b.sum-state.health.profile.budget)+' 元'):'未填费用不代表0元，需补齐后判断全天预算。'}</span>${b.remainder!==null?`<span>扣除早餐、午餐，晚餐最多可用 ${fitnessMoney(b.remainder)} 元${b.remainder<0?'，前两餐已超出预算':''}。</span>`:''}</div>`;}
function fitnessNutrition(){
 const p=state.health.profile,m=state.health.meals[selected]||{},rs=fitnessReviewOrder(),last=rs.at(-1),draft=rs.find(r=>r.date===selected)||{};
 return pagehead('把训练、吃饭和恢复连起来。','每日预算30元 · 早餐可选 · 不额外安排水果 · 每10天复盘一次')+
 fitnessReviewBanner()+`<div class="metrics"><div class="metric"><div class="label">当前试行能量</div><div class="value">约2400<small>千卡/天</small></div><div class="muted">根据恢复与趋势调整</div></div><div class="metric"><div class="label">碳水目标</div><div class="value">${p.carbs}<small>克/天</small></div><div class="muted">包括面、土豆、饭和奶等</div></div><div class="metric"><div class="label">蛋白质目标</div><div class="value">${p.protein}<small>克/天</small></div><div class="muted">按实际可食部分核对</div></div><div class="metric"><div class="label">脂肪目标</div><div class="value">${p.fat}<small>克/天</small></div><div class="muted">肉蛋奶和炒菜油都要算</div></div></div>
 <div class="twocol"><section class="card"><h2>每天怎么吃</h2><div class="table-scroll"><table class="fitness-table"><thead><tr><th>餐次</th><th>安排</th><th>费用</th></tr></thead><tbody>
 <tr><td>早餐，可选</td><td>2个水煮蛋约1.6元，余款安排自备主食；奶按实际分摊价搭配。</td><td>≤3元</td></tr>
 <tr><td>练后午餐</td><td>保留两只鸡腿＋约一拳头青菜，安排米饭；米饭另收费也计入。</td><td>15–17元</td></tr>
 <tr><td>晚餐</td><td>去皮鸭腿1–2只（4元/只），加主食与蔬菜；余款选蛋或豆腐。</td><td>吃早餐时10–12元；不吃时13–15元</td></tr></tbody></table></div>
 <p class="hint">两只鸭腿要8元，若余款不够主食和蔬菜，改一只搭配合适价位的蛋或豆腐。不吃早餐时把营养分到午晚餐；午前明显饿或乏力时保留简单早餐。</p>
 <p class="hint">自备面条看包装区分干重与熟重；土豆算主食。标重130g的鸭腿是否含骨尚未确认，不能按130g纯肉计算。费用方案不是营养已达标的证明，先校准一次主食、可食肉重和标签。</p>
 <p class="hint">不额外安排水果；蔬菜尽量多样，全天争取300–500g。现阶段不强制购买蛋白粉、锌镁或单项维生素。</p></section>
 <section class="card"><h2>${selected} · 饮食与费用</h2><form id="fitnessMealForm"><div class="formrow">${[['breakfastCost','早餐费用','3'],['lunchCost','午餐费用','17'],['dinnerCost','晚餐费用','10']].map(([k,t,ph])=>`<label>${t}（元）<input type="number" name="${k}" min="0" max="1000" step="0.1" value="${esc(m[k]??'')}" placeholder="${ph}"></label>`).join('')}</div><div id="fitnessBudgetLive">${fitnessBudgetStatus(m)}</div>
 <div class="formrow"><label>实际蛋白质 / 估算量（g，可空）<input type="number" name="protein" min="0" max="500" step="1" value="${esc(m.protein??'')}" placeholder="不知道时留空"></label><label>记录把握<select name="certainty">${['未称量，先记录食物','按标签或份量估算','已称量并核对'].map(x=>`<option ${m.certainty===x?'selected':''}>${x}</option>`).join('')}</select></label></div>
 <label>今天实际吃了什么<textarea name="foods" rows="4" maxlength="4000" placeholder="早餐、午餐、晚餐；记录米饭/面条重量，鸡腿去骨肉量和牛奶标签等">${esc(m.foods??'')}</textarea></label>
 <p class="hint">空着的营养量不会自动算成达标；费用和蛋白质记录都以你实际填写为准。</p><button class="primary" type="submit">保存当天饮食</button></form></section>
 <section class="card" id="fitnessReviewSection"><h2>10天复盘 · 体重与蛋白质</h2><p class="hint">不要求每天称。尽量晨起如厕后、进食前、穿着相近再记录。一次变化可能含水分，不自动据此减餐。${last?'最近记录 '+esc(last.date)+'：'+esc(last.weight)+'kg。':'初始93kg是你提供的参考，尚无实测记录。'}</p>
 <form id="fitnessReviewForm"><div class="formrow"><label>本次测量日期<input name="date" type="date" required max="${localDate()}" value="${selected>localDate()?localDate():selected}"></label><label>体重（kg）<input name="weight" type="number" required min="30" max="300" step="0.1" value="${esc(draft.weight??'')}" placeholder="填实际测量值"></label></div>
 <div class="formrow"><label>腰围（cm，可空）<input name="waist" type="number" min="30" max="250" step="0.1" value="${esc(draft.waist??'')}"></label><label>这阶段日均蛋白质（g，可空）<input name="proteinAverage" type="number" min="0" max="500" step="1" value="${esc(draft.proteinAverage??'')}" placeholder="没有数据时留空"></label></div>
 <label>训练与恢复<select name="recovery">${['状态稳定','力量或跑步表现进步','持续疲劳或表现下降','未记录'].map(x=>`<option ${draft.recovery===x?'selected':''}>${x}</option>`).join('')}</select></label><label>饥饿、睡眠与饮食备注<textarea name="note" rows="3" maxlength="3000">${esc(draft.note??'')}</textarea></label>
 <div id="fitnessProteinPreview" class="review">输入体重后显示按1.6g/kg换算的蛋白质参考；保存不会自动改餐量。</div><button class="primary topspace" type="submit">保存本次复盘</button></form></section>
 <section class="card"><h2>复盘记录</h2>${rs.length?`<div class="table-scroll"><table class="fitness-table"><thead><tr><th>日期</th><th>体重</th><th>腰围</th><th>日均蛋白</th></tr></thead><tbody>${[...rs].reverse().map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(r.weight)}kg</td><td>${r.waist!==''&&r.waist!==undefined?esc(r.waist)+'cm':'未记'}</td><td>${r.proteinAverage!==''&&r.proteinAverage!==undefined?esc(r.proteinAverage)+'g':'未记'}</td></tr><tr><td colspan="4" class="hint">${esc(r.recovery)} · ${esc(r.note??'')}<br>新体重蛋白参考 ${fitnessSuggestedProtein(r.weight)}g/天（1.6g/kg取整到5g）。<button class="quiet" data-apply-review="${esc(r.date)}">以这次体重更新参考</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">保存第一条实际测量后，记录会出现在这里。</div>'}
 <p class="hint">点击更新参考只会修改参考体重与蛋白质目标，碳水与总能量保持当前设置。体重下降时先检查摄入和恢复，再决定是否调整；不按一次涨跌自动削减食物。</p>
 <form id="fitnessProfileForm"><h3>复盘设置</h3><div class="formrow"><label>参考体重（kg）<input name="weight" type="number" min="30" max="300" step="0.1" required value="${p.weight}"></label><label>当前蛋白目标（g/天）<input name="protein" type="number" min="30" max="400" step="1" required value="${p.protein}"></label></div><div class="formrow"><label>复盘起始日<input name="startDate" type="date" required value="${p.startDate}"></label><label>间隔（天）<input name="interval" type="number" min="1" max="60" step="1" required value="${p.interval}"></label></div><p class="hint">首个复盘日为起始日＋间隔；之后按最近一次实际复盘日期顺延。默认10天，仅在打开网站时显示提示。</p><button type="submit">保存复盘设置</button></form></section>
 <section class="card wide"><h2>怎么调整，以及依据</h2><p class="hint">先执行约两周，结合体重、腰围、上课精力和训练表现。持续饿、疲劳或掉重过快，可评估增加25–40g碳水；两周体重和腰围均无变化时，先核对油、主食和零食，不直接认定需要少吃。</p><p class="hint">每10天复盘是你的偏好，也见于视频第三方整理，完整本人字幕尚未核实。当前约2400千卡、250g碳水、150g蛋白、90g脂肪是定制试行目标，不冒充原视频处方。按1.6g/kg换算只是蛋白质的起始参考，需结合实际饮食与恢复。</p>
 <a class="source" href="https://post.smzdm.com/p/axkwvrk9/" target="_blank" rel="noopener">减脂长视频第三方整理（待核对原视频）↗</a><a class="source" href="https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/" target="_blank" rel="noopener">NIH运动营养范围 ↗</a><a class="source" href="https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html" target="_blank" rel="noopener">CDC体重管理依据 ↗</a></section></div>`;
}

settings=()=>fitnessBaseSettings()+`<section class="card"><h2>中午训练与升级前备份</h2><p class="hint">默认日程已改为中午三分化，保留原课表、笔记、打卡、恢复记录和你修改过的事项。自定义事项若与新计划重叠，今日页仍会提示。新增饮食、复盘与动作打卡也随“导出全部数据”一起备份。</p><button id="fitnessExportOld">导出升级前备份 ↓</button><button data-open-nutrition>打开饮食与10天复盘 →</button><p class="hint">记录仍在当前浏览器，换设备需导出/导入，不会自动云同步。网页到期提示不等于系统通知。</p></section>`;
function fitnessDownload(value,filename){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([value],{type:'application/json'}));a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function fitnessBind(){
 app.querySelectorAll('[data-open-nutrition]').forEach(b=>b.onclick=()=>{navigate('nutrition');$('#fitnessReviewSection')?.scrollIntoView({behavior:'smooth'});});
 app.querySelectorAll('[data-fitness-exercise]').forEach(c=>c.onchange=()=>{state.health.exercises[selected+'|'+c.dataset.fitnessExercise]=c.checked;save();});
 app.querySelectorAll('[data-check]').forEach(c=>{if(c.dataset.check.startsWith('review-'))c.onchange=()=>{navigate('nutrition');$('#fitnessReviewSection')?.scrollIntoView({behavior:'smooth'});};});
 app.querySelectorAll('[data-edit]').forEach(b=>{if(b.dataset.edit.startsWith('review-'))b.onclick=()=>navigate('nutrition');});
 const meal=$('#fitnessMealForm');
 if(meal){
  meal.oninput=()=>{$('#fitnessBudgetLive').innerHTML=fitnessBudgetStatus(Object.fromEntries(new FormData(meal)));};
  meal.onsubmit=e=>{e.preventDefault();state.health.meals[selected]=Object.fromEntries(new FormData(meal));if(save())toast('已保存 '+selected+' 的饮食与费用');};
 }
 const review=$('#fitnessReviewForm');
 if(review){
  review.oninput=()=>{const w=Number(review.elements.weight.value);$('#fitnessProteinPreview').textContent=fitnessNumber(review.elements.weight.value,30,300)?`本次 ${w}kg × 1.6 ≈ ${fitnessSuggestedProtein(w)}g蛋白质/天；当前目标 ${state.health.profile.protein}g。保存记录不会自动减少食物。`:'输入实际体重后显示蛋白质参考。';};
  review.onsubmit=e=>{e.preventDefault();const r=Object.fromEntries(new FormData(review));if(!fitnessDateValid(r.date)||r.date>localDate()||!fitnessNumber(r.weight,30,300)){toast('请填写有效的实际测量日期与体重');return;}r.weight=Number(r.weight);state.health.reviews=state.health.reviews.filter(x=>x.date!==r.date);state.health.reviews.push(r);selected=r.date;save();render();toast('复盘已保存，下次 '+fitnessDue());};
 }
 const profile=$('#fitnessProfileForm');
 if(profile)profile.onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(profile));if(!fitnessDateValid(v.startDate)||!fitnessNumber(v.weight,30,300)||!fitnessNumber(v.protein,30,400)||!fitnessNumber(v.interval,1,60)||!Number.isInteger(Number(v.interval))){toast('请检查复盘设置');return;}Object.assign(state.health.profile,{weight:Number(v.weight),protein:Number(v.protein),startDate:v.startDate,interval:Number(v.interval)});save();render();toast('复盘设置已保存');};
 app.querySelectorAll('[data-apply-review]').forEach(b=>b.onclick=()=>{const r=state.health.reviews.find(x=>x.date===b.dataset.applyReview);if(!r)return;state.health.profile.weight=Number(r.weight);state.health.profile.protein=fitnessSuggestedProtein(r.weight);save();render();toast('参考体重与蛋白目标已更新；碳水和热量未自动下调');});
 const old=$('#fitnessExportOld');if(old)old.onclick=()=>{const value=localStorage.getItem(FITNESS_BACKUP_KEY);if(value)fitnessDownload(value,'日常有序-升级前备份.json');else toast('本浏览器没有升级前备份，可用页面顶部导出当前全部数据');};
}
render=()=>{
 if(state.fitnessRevision!==FITNESS_REVISION){state=fitnessUpgrade(state);save();}
 if(page==='nutrition'){
  document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  $('#breadcrumb').textContent='我的日课 / 饮食与复盘';app.innerHTML=fitnessNutrition();bind();
 }else fitnessBaseRender();
 fitnessBind();
};
if(!document.querySelector('[data-page="nutrition"]')){
 const navButton=document.createElement('button');navButton.dataset.page='nutrition';navButton.innerHTML='◉ <span>饮食与复盘</span>';
 document.querySelector('nav').insertBefore(navButton,document.querySelector('[data-page="notes"]'));
}
document.querySelector('[data-page="nutrition"]').onclick=()=>navigate('nutrition');
window.addEventListener('hashchange',()=>{if(location.hash==='#nutrition'){page='nutrition';render();}});
if(location.hash==='#nutrition')page='nutrition';
render();
