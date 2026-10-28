/* October revision. New exercise keys preserve earlier workout records. */
const trainingOldEvents=fitnessPlanEvents(),trainingPreviousEventsFor=eventsFor,trainingLegacyEvents=fitnessLegacyDefaults().events;
const trainingLink=(id,label='谭成义 · 看教学',note='原视频标题已核对；具体组次为本计划建议。')=>({url:'https://www.douyin.com/video/'+id,label,note});
const trainingRef=(url,label,note)=>({url,label,note});
const trainingJump=trainingRef('https://www.nsca.com/education/videos/plyometric-implementation-setup-and-execution-of-jump-landing-positions-to-decrease-likelihood-of-injuries/','NSCA · 落地与进阶参考','弹跳目标的个人补充；英文资料，不是谭成义原处方。');
const trainingSide=trainingRef('https://www.nasm.org/resource-center/exercise-library/side-plank','NASM · 侧平板教学','个人核心补充，英文资料。');
const trainingBird=trainingRef('https://www.nasm.org/resource-center/exercise-library/bird-dog','NASM · 鸟狗式教学','恢复日可选，不是每日必做任务。');
const trainingAbs=trainingLink('7657365167379023973','谭成义 · 卷腹 06:53 起','原页章节定位；同片01:10为悬垂举腿进退阶，组次为个人建议。');
fitnessWorkouts.splice(0,fitnessWorkouts.length,
 {id:'pull',day:4,name:'A · 背、二头与后束',time:'约60–75分钟 · 含热身',rows:[
 ['对握高位下拉','3–4 × 8–12','躯干稳定，不大幅后仰。第一轮先3组。',trainingLink('7662562022056718449')],
 ['坐姿绳索划船','3 × 8–12','控制还原，不甩腰；胸托划船可替代。',trainingLink('7674643042243064997')],
 ['反向蝴蝶机','2–3 × 12–15','先2组，轻重量练后束；无机器可用轻哑铃反向飞鸟。',trainingLink('7661923214516256369'),trainingLink('7670171990876103153','哑铃反向飞鸟 · 替代教学')],
 ['哑铃弯举','2–3 × 10–15','先2组，上臂稳定，避免甩动。',trainingLink('7648931004442846193','谭成义 · 手臂整期参考','已核对手臂教学主题；尚未核实此动作的具体章节。')]
 ]},
 {id:'push',day:2,name:'B · 胸、肩与三头',time:'约60–75分钟 · 含热身',rows:[
 ['哑铃卧推 / 器械推胸','3–4 × 8–12','选一种，先3组；卧推保持肩部舒适。',trainingLink('7668880941976944817','谭成义 · 哑铃胸推教学','此链接为哑铃胸推与肩推讲解，器械推胸不是同一器械教学。')],
 ['上斜哑铃卧推','2 × 8–12','时间长或推肩表现明显下降时，优先省略此项。',trainingLink('7650309381392785073','谭成义 · 胸部整期参考','胸部教学整期；尚未核实上斜卧推的具体章节。')],
 ['靠背坐姿哑铃推肩','2 × 8–12','新增肩部主项；稳定躯干，选择舒适幅度。',trainingLink('7668880941976944817','谭成义 · 哑铃肩推教学')],
 ['哑铃侧平举','3 × 12–20','第一轮先2组，控制重量，不甩腰。',trainingLink('7666644718105452666')],
 ['绳索三头下压','2–3 × 10–15','先2组，上臂相对固定，不用全身压重量。',trainingLink('7648931004442846193','谭成义 · 手臂整期参考','已核对手臂教学主题；尚未核实绳索下压的具体章节。')]
 ]},
 {id:'legs',day:6,name:'C · 腿与弹跳',time:'先跳跃，再力量 · 约60–75分钟',rows:[
 ['小幅起跳后落地停稳','2 × 3','热身后，落地停约2秒；每次重新站稳。',trainingJump],
 ['原地摆臂纵跳','2 × 3','跳跃总计12次，组间约2分钟。跳高下降或落地不稳即结束。',trainingRef(trainingJump.url,'NSCA · 跳跃落地原则','这是落地与进阶参考，不是原地摆臂纵跳的完整单动作示范。')],
 ['高脚杯深蹲','3 × 8–12','控制深度与躯干；后续再考虑4组。腿举可替代。',trainingLink('7629718942222650670','合作系列 · 腿部整期参考','谭成义与凯圣王合作内容；发布说明列出高脚杯深蹲，未核实章节。')],
 ['保加利亚分腿蹲','2 × 每侧8–10','先自重、可扶支撑，不稳先退阶普通分腿蹲。',trainingLink('7564324902745656625')],
 ['哑铃罗马尼亚硬拉','2–3 × 8–10','先2组，髋向后折叠，不以碰地为目标。',trainingLink('7671852814386030521')],
 ['腿弯举（可选）','2 × 10–15','器械按现场调节；时间紧或腿部疲劳时可省略。',trainingRef('https://www.nasm.org/workout-exercise-guidance/how-to-seated-leg-curl','NASM · 坐姿腿弯举教学','英文单动作资料；个人辅助动作安排。')],
 ['提踵','2–3 × 12–15','先2组，控制下降，不快速弹起。',trainingRef('https://www.nasm.org/resource-center/blog/training/calf-training-how-to-program-this-stubborn-muscle-group-for-clients','NASM · 小腿训练参考','英文综述，含站姿与坐姿提踵参考，并非谭成义原视频。')]
 ]});
const trainingCore=[
 ['仰卧卷腹','2–3 × 10–15','垫上或平凳即可，肩胛稍离地，不拉脖子。每次先选一个动作。',trainingAbs],
 ['屈膝举腿（可选替换）','2 × 8–12','仅在有稳定支撑、能控制时做；握力或肩部不适就用卷腹。',trainingLink('7657365167379023973','谭成义 · 举腿 01:10 起','章节为悬垂举腿进退阶；本计划的屈膝版本与组次是个人退阶建议。')],
 ['侧平板（可选替换）','2 × 每侧20–30秒','躯干保持直线，难时屈膝退阶；不是与卷腹全部叠加。',trainingSide],
 ['鸟狗式（恢复日可选）','1–2 × 每侧6次','轻松控制，不力竭；疲劳时跳过。',trainingBird]
];
function trainingExerciseKey(w,i){return w.id+'-r3-'+i;}
function trainingSourceHTML(s){return `<div class="exercise-source"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a><small>${esc(s.note)}</small></div>`;}
function trainingRowsHTML(w){return w.rows.map((r,i)=>{const key=trainingExerciseKey(w,i),checked=state.health.exercises[selected+'|'+key];return `<div class="workout-row ${checked?'is-done':''}"><input type="checkbox" data-fitness-exercise="${key}" aria-label="完成动作 ${esc(r[0])}" ${checked?'checked':''}><span class="workout-index">${String(i+1).padStart(2,'0')}</span><div class="workout-content"><strong>${esc(r[0])}</strong><span>${esc(r[2])}</span>${r.slice(3).map(trainingSourceHTML).join('')}</div><b class="workout-reps">${esc(r[1])}</b></div>`;}).join('');}
uiWorkoutCard=w=>`<section class="card workout-card" data-workout-card="${w.id}"><div class="workout-cover"><div><span class="eyebrow">${w.id==='pull'?'A':w.id==='push'?'B':'C'} / TRAINING NOTES</span><h2>${esc(w.name)}</h2><p>${esc(w.time)}</p></div><span class="workout-count">${w.rows.filter((r,i)=>state.health.exercises[selected+'|'+trainingExerciseKey(w,i)]).length}<small>/ ${w.rows.length} 动作</small></span></div><p class="hint">热身6–8分钟。第一轮主项3组、辅助2组，再按恢复逐步加量；每组留2–3次余力。</p><div class="workout-list">${trainingRowsHTML(w)}</div><div class="workout-footer">主项休息2–3分钟 · 辅助60–90秒${w.id==='legs'?' · 跳跃组间约2分钟':''}</div></section>`;
function trainingCycleIndex(date,start){return Math.round((new Date(date+'T12:00:00')-new Date(start+'T12:00:00'))/86400000);}
function trainingCycleWorkout(date){const c=state.trainingCycle;if(!c||!fitnessDateValid(c.startDate))return null;const n=trainingCycleIndex(date,c.startDate);return n<0||n%2?null:fitnessWorkouts[Math.floor(n/2)%3];}
eventsFor=date=>{
 const es=trainingPreviousEventsFor(date),c=state.trainingCycle;
 if(!c||!fitnessDateValid(c.startDate)||date<c.startDate)return es;
 const w=trainingCycleWorkout(date),kept=es.filter(e=>!trainingOldEvents.some(old=>fitnessSameEvent(old,e)&&/fitness-v2-(gym|lunch|rest|english)-/.test(e.id)));
 // On busy Wednesday/Friday training days, reuse the existing evening study block.
 if(w){const math=kept.find(e=>e.start==='13:10'&&e.end==='13:40'&&e.title==='高数 · 当天一组题'&&trainingLegacyEvents.some(old=>fitnessSameEvent(old,e)));const night=kept.find(e=>e.start==='21:40'&&e.end==='22:10'&&e.title==='英语 / 高数 · 巩固30分钟'&&trainingLegacyEvents.some(old=>fitnessSameEvent(old,e)));if(math&&night){kept.splice(kept.indexOf(math),1);kept[kept.indexOf(night)]={...night,title:'高数20分钟 / 英语10分钟',note:'隔日训练日的午间高数并入原晚间30分钟；不额外延后睡眠。疲劳时减少学习量。'};}}
 const add=(id,start,end,title,type,note='')=>kept.push({id:'training-r3-'+id+'-'+date,date,day:dayOf(date),repeat:'once',start,end,title,type,note});
 if(w){add('gym','12:00','13:00',w.name,'gym','动作见训练页；60分钟到点优先减少可选辅助，保留午餐。');add('lunch','13:05','13:25','练后午餐与补水','rest');add('english','13:30','13:50','英语 · 单词与听力','study','午间20分钟，晚间补10分钟。');}
 else{add('lunch','11:40','12:20','午餐与放松','rest');add('rest','12:20','12:40','午休 / 闭目休息','rest');add('english','12:40','13:10','英语 · 单词与听力','study');}
 return kept.sort((a,b)=>a.start.localeCompare(b.start));
};
training=()=>pagehead('训练手册','2026.10.28 修订 · 每个动作都有学习入口')+`<section class="training-intro"></section><section class="card cycle-settings"><h2>按恢复轮换，不赶进度。</h2><p>A背二头 → 恢复 → B胸肩三头 → 恢复 → C腿弹跳 → 恢复。相邻训练约48小时，同一训练约6天；疲劳时顺延。</p><form id="trainingCycleForm"><label>下一轮A日开始日期<input type="date" name="startDate" required value="${esc(state.trainingCycle?.startDate||selected)}"></label><button class="primary" type="submit">${state.trainingCycle?'保存循环日期':'启用隔日循环'}</button></form><p class="hint">${state.trainingCycle?'已启用：'+esc(state.trainingCycle.startDate)+' 起，今日安排和一周节奏随日期轮换。':'尚未启用循环；原日程保留。选择实际开始日后启用，不会自动记作完成。'} 已有自定义课表保留；若午间与课程重叠，请在今日安排调整，勿挤掉午餐。</p></section><div class="ui-tabs" role="tablist" aria-label="选择训练日">${fitnessWorkouts.map(w=>`<button role="tab" data-workout-tab="${w.id}">${esc(w.name)}</button>`).join('')}</div><div class="workout-layout"><div>${fitnessWorkouts.map(uiWorkoutCard).join('')}<section class="card"><h2>腹部与核心 · 每次选一个</h2><p class="hint">正式练腹约每周3次，任意连续7天最多3次；不是每天把下列动作全部做完。第4次力量课不再加正式练腹。恢复日可选轻松鸟狗式。</p><div class="workout-list">${trainingRowsHTML({id:'core',rows:trainingCore})}</div>${trainingSourceHTML(trainingLink('7657365167379023973','频率出处 · 腹部训练原视频','原页本人回复建议一周3次左右；不是本计划所有组次的来源。'))}</section></div><aside class="training-aside"><section class="card"><h2>记下真实感受</h2>${logForm()}</section><section class="card"><h3>先动作，再加量</h3><p>仅完成一周基础训练，先执行一轮，再把部分主项提高到4组。辅助动作和跳跃不一起翻倍。</p><p>校园跑与体育课计入总负荷，腿日不追配速；关节痛停止相应动作，明显疲劳减组或顺延。</p><p>正式练腹频率与动作选择分开记录；勾选只表示做过，不自动计算训练量。</p><a href="training-review.md" download>本次修订与来源说明 ↓</a></section></aside></div><details class="card"><summary>学习链接怎么用</summary><p>“看教学”为对应主题原视频；“整期参考”没有核实单动作章节，打开后需自行定位。弹跳与部分核心使用英文一般资料，已注明，不能当作谭成义本人处方。抖音可能要求登录或跳转App。</p><p>组次、轮换、弹跳和个体退阶为你的适应版；并未看完全部作品。</p>${trainingSourceHTML(trainingLink('7700836420282731898','10月27日 · 训练计划原页','平台章节13:13讨论个人安排，18:51讨论休息；未完整核对音画。'))}</details>`;
const trainingPriorRender=render;
render=()=>{
 trainingPriorRender();
 if(page==='training'){
  const intro=app.querySelector('.training-intro');if(intro)intro.innerHTML='<div><span class="eyebrow">FIELD NOTES / 2026.10.28</span><h2>练清楚，也学明白。</h2><p>背与二头 · 胸肩与三头 · 腿与弹跳。点开每个动作下方的来源学习。</p></div>';
  app.querySelectorAll('[data-fitness-exercise]').forEach(c=>c.onchange=()=>{state.health.exercises[selected+'|'+c.dataset.fitnessExercise]=c.checked;save();c.closest('.workout-row').classList.toggle('is-done',c.checked);const w=fitnessWorkouts.find(w=>c.dataset.fitnessExercise.startsWith(w.id+'-'));if(w)c.closest('.workout-card').querySelector('.workout-count').innerHTML=w.rows.filter((r,i)=>state.health.exercises[selected+'|'+trainingExerciseKey(w,i)]).length+'<small>/ '+w.rows.length+' 动作</small>';});
  app.querySelector('#trainingCycleForm').onsubmit=e=>{e.preventDefault();const startDate=new FormData(e.currentTarget).get('startDate');if(!fitnessDateValid(startDate))return;state.trainingCycle={startDate};save();uiWorkout='pull';render();};
 }
 // Virtual cycle events are edited through the cycle date, not the legacy event dialog.
 app.querySelectorAll('[data-edit]').forEach(b=>{if(b.dataset.edit.startsWith('training-r3-'))b.onclick=()=>navigate('training');});
 if(state.trainingCycle&&page==='week'){const notice=app.querySelector('.notice');if(notice)notice.textContent='隔日循环已启用：A背二头、B胸肩三头、C腿弹跳；中间恢复一天。保留的课程与自定义安排若重叠，请手动调整。';}
};
render(); // training boot
