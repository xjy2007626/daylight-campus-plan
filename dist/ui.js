/* A calmer, mobile-first presentation. All planner records keep their existing keys. */
let uiFoodTab='meals',uiWorkout='';
const uiBaseRender=render,uiBaseNutrition=fitnessNutrition;
function uiWorkoutCard(w){
 const leg=w.id==='legs',completed=w.rows.filter((r,i)=>state.health.exercises[selected+'|'+w.id+'-'+i]).length;
 return `<section class="card workout-card" data-workout-card="${w.id}"><div class="workout-cover"><div><span class="eyebrow">${w.id.toUpperCase()} DAY</span><h2>${esc(w.name)}</h2><p>${w.time}</p></div><span class="workout-count">${completed}<small>/ ${w.rows.length} 动作</small></span></div><p class="hint">热身6–8分钟，再开始下列正式组。${leg?'跳跃在力量训练前，先练落地。':'每组保留约2–3次余力。'}</p><div class="workout-list">${w.rows.map((r,i)=>`<label class="workout-row ${state.health.exercises[selected+'|'+w.id+'-'+i]?'is-done':''}"><input type="checkbox" data-fitness-exercise="${w.id+'-'+i}" aria-label="完成动作 ${esc(r[0])}" ${state.health.exercises[selected+'|'+w.id+'-'+i]?'checked':''}><span class="workout-index">${String(i+1).padStart(2,'0')}</span><span class="workout-content"><strong>${esc(r[0])}</strong><span>${esc(r[2])}</span></span><b class="workout-reps">${esc(r[1])}</b></label>`).join('')}</div><div class="workout-footer"><span>主项休息 90–150 秒</span><span>${leg?'跳跃组间约2分钟':'辅助与核心 60–90 秒'}</span></div>${leg?'<div class="notice">前两周约12次起跳落地；不叠加大量摸框。恢复良好后再逐步加量，关节痛时停止跳跃。</div>':''}</section>`;
}
training=()=>pagehead('练得扎实，也恢复充分。','周二推 · 周四拉 · 周六腿与弹跳，先稳定执行4周')+`<section class="training-intro"><div><span class="eyebrow">SMALL STEPS, STRONGER DAYS</span><h2>一次练好一个重点。</h2><p>中午完成训练，再吃午饭。弹跳、腹部和核心已经融入计划。</p></div><div class="training-badge"><strong>3</strong><span>次 / 周</span></div></section><div class="ui-tabs" role="tablist" aria-label="选择训练日">${fitnessWorkouts.map(w=>`<button role="tab" data-workout-tab="${w.id}">${w.id==='push'?'周二 · 推':w.id==='pull'?'周四 · 拉':'周六 · 腿与弹跳'}</button>`).join('')}</div><div class="workout-layout"><div>${fitnessWorkouts.map(uiWorkoutCard).join('')}</div><aside class="training-aside"><section class="card"><span class="eyebrow">TODAY’S RECOVERY</span><h2>记下真实的感受。</h2>${logForm()}</section><section class="card quiet-card"><h3>先动作，再加量</h3><p class="hint">前两周用低组数熟悉动作。连续两次规范做到次数上限，仍有余力时，再加最小档重量。</p><p class="hint">校园跑放慢到能说完整句子，腿日不追配速；体育课也计入负荷。</p><a href="plan.md" download>完整训练与饮食说明 ↓</a></section></aside></div><details class="card source-details"><summary>训练依据与适用范围</summary><p class="hint">参考谭成义与凯圣王系列的推、拉、腿结构。完整原视频字幕尚未核实，具体动作组次、弹跳和核心为个人适应版，不标作本人原话。</p><a class="source" href="https://www.bilibili.com/video/BV17ooLBUEqS/" target="_blank" rel="noopener">三分化系列 ↗</a><a class="source" href="https://acsm.org/resistance-training-guidelines-update-2026/" target="_blank" rel="noopener">ACSM训练依据 ↗</a><a class="source" href="https://www.nsca.com/education/videos/plyometric-implementation-setup-and-execution-of-jump-landing-positions-to-decrease-likelihood-of-injuries/" target="_blank" rel="noopener">NSCA落地与跳跃 ↗</a></details>`;
fitnessNutrition=()=>uiBaseNutrition().replace('<div class="twocol">','<div class="twocol food-layout">');
function uiSetFoodTab(tab){
 uiFoodTab=tab;
 app.querySelectorAll('[data-food-panel]').forEach(el=>el.hidden=el.dataset.foodPanel!==tab);
 app.querySelectorAll('[data-food-tab]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.foodTab===tab));b.classList.toggle('active',b.dataset.foodTab===tab);});
 // Keep photo object URLs alive when merely switching panels.
}
function uiSetWorkout(id){
 uiWorkout=id;
 app.querySelectorAll('[data-workout-card]').forEach(el=>el.hidden=el.dataset.workoutCard!==id);
 app.querySelectorAll('[data-workout-tab]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.workoutTab===id));b.classList.toggle('active',b.dataset.workoutTab===id);});
}
function uiFoodLayout(){
 const head=app.querySelector('.pagehead'),tabs=document.createElement('div');tabs.className='ui-tabs food-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','饮食页面');tabs.innerHTML='<button role="tab" data-food-tab="meals">饮食记录</button><button role="tab" data-food-tab="photos">餐食相册</button><button role="tab" data-food-tab="review">10天复盘</button>';head.after(tabs);
 const meal=$('#fitnessMealForm')?.closest('section'),photo=$('#mealPhotos'),review=$('#fitnessReviewSection'),profile=$('#fitnessProfileForm')?.closest('section'),metrics=app.querySelector('.metrics'),layout=app.querySelector('.food-layout');
 for(const [el,panel] of [[meal,'meals'],[photo,'photos'],[review,'review'],[profile,'review'],[metrics,'meals']])if(el)el.dataset.foodPanel=panel;
 if(layout){layout.querySelectorAll(':scope > section').forEach(el=>{if(el===meal||el===review||el===profile)return;el.dataset.foodPanel='meals';if(el.querySelector('table')){el.classList.add('meal-guide');}else if(el.querySelector('a.source')){el.classList.add('food-sources');}});}
 const banner=app.querySelector('.review-banner');if(banner){banner.classList.add('compact-review');banner.dataset.foodPanel='meals';}
 tabs.querySelectorAll('button').forEach(b=>b.onclick=()=>uiSetFoodTab(b.dataset.foodTab));
 if(layout&&meal){meal.style.order='-1';}
 app.querySelectorAll('[data-open-nutrition]').forEach(b=>b.onclick=()=>{uiFoodTab='review';uiSetFoodTab('review');$('#fitnessReviewSection')?.scrollIntoView({behavior:'smooth',block:'start'});});
 uiSetFoodTab(uiFoodTab);
}
render=()=>{
 uiBaseRender();document.body.dataset.view=page;
 if(page==='nutrition')uiFoodLayout();
 if(page==='training'){
  if(!uiWorkout)uiWorkout=fitnessWorkouts.find(w=>w.day===dayOf(selected))?.id||'push';
  uiSetWorkout(uiWorkout);app.querySelectorAll('[data-workout-tab]').forEach(b=>b.onclick=()=>uiSetWorkout(b.dataset.workoutTab));
  app.querySelectorAll('[data-fitness-exercise]').forEach(c=>{const original=c.onchange;c.onchange=e=>{original?.(e);c.closest('.workout-row').classList.toggle('is-done',c.checked);const w=fitnessWorkouts.find(w=>c.dataset.fitnessExercise.startsWith(w.id+'-'));const card=c.closest('.workout-card');card.querySelector('.workout-count').innerHTML=w.rows.filter((r,i)=>state.health.exercises[selected+'|'+w.id+'-'+i]).length+'<small>/ '+w.rows.length+' 动作</small>';};});
 }
 // A compact global settings button replaces the former primary menu item.
 if(!$('#uiSettings')){const b=document.createElement('button');b.id='uiSettings';b.className='quiet ui-settings-button';b.textContent='数据与设置';b.onclick=()=>navigate('settings');document.querySelector('.headeractions').prepend(b);}
 if(page!=='nutrition')app.querySelectorAll('[data-open-nutrition]').forEach(b=>{const original=b.onclick;b.onclick=e=>{uiFoodTab='review';original?.(e);};});
};
document.querySelector('meta[name="theme-color"]').content='#243d36';
render();
