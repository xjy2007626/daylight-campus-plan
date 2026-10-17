/* Campus field journal: presentation only; storage and saved records are unchanged. */
const journalBaseRender=render;
function journalDate(date){const [,m,d]=date.split('-').map(Number);return `${m}月${d}日`;}
const journalPageNames={today:'今日',week:'一周',training:'训练',nutrition:'饮食',notes:'备忘',settings:'数据与备份'};
pagehead=(title,sub)=>{
 const main={today:journalDate(selected),week:'这一周，怎么过。',training:'训练手册',nutrition:'一日三餐',notes:'随手记',settings:'数据与备份'}[page]||title;
 const weekday=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][dayOf(selected)],gym=eventsFor(selected).some(e=>e.type==='gym');
 return `<div class="pagehead journal-heading"><div class="journal-title"><div class="journal-kicker">${selected.slice(0,4)} · ${journalPageNames[page]||'日常'}</div><div class="journal-title-line"><h1>${esc(main)}</h1>${page==='today'?`<span class="journal-stamp">${gym?'训练日':'平常日'}</span>`:''}</div>${page==='today'?`<div class="journal-weekday">${weekday}</div>`:`<div class="muted">${esc(sub)}</div>`}</div>${page==='today'?`<figure class="journal-cover"><img src="assets/campus-court.jpg" alt="秋日下午的校园球场，生成的封面氛围图" width="1536" height="1024" fetchpriority="high"><figcaption>球场的傍晚。<span>封面氛围图</span></figcaption></figure>`:''}<div class="journal-date-control">${datecontrol()}</div></div>`;
};
rows=es=>es.length?es.map(e=>`<div class="event ${done(e)?'done':''}"><time><b>${e.start}</b><small>至 ${e.end}</small></time><input type="checkbox" data-check="${esc(e.id)}" aria-label="完成 ${esc(e.title)}" ${done(e)?'checked':''}><div class="journal-event-content"><strong>${esc(e.title)}</strong><p><span class="tag ${e.type}">${labels[e.type]}</span>${esc(e.note)}</p></div><button class="edit" data-edit="${esc(e.id)}" aria-label="编辑 ${esc(e.title)}">⋯</button></div>`).join(''):'<div class="empty">今天还没有安排，留一点空白也很好。</div>';
today=()=>{
 const es=eventsFor(selected),study=es.filter(e=>e.type==='study'),planned=study.reduce((s,e)=>s+duration(e),0),completed=study.filter(e=>done(e)).reduce((s,e)=>s+duration(e),0),count=es.filter(e=>done(e)).length,collisions=conflicts(es),tasks=state.notes.filter(n=>!n.archived&&memoAvailable(n)&&!memoDone(n));
 return pagehead('今日','')+`<div class="journal-opening"><p>今天，先做好这几件事。</p><span>学习 ${completed} / ${planned} 分钟 <i>·</i> 轻松跑 3 公里 <i>·</i> 留够睡眠</span></div>${collisions.length?`<div class="notice">时间有重叠：${collisions.map(esc).join('；')}。点击“⋯”可以调整。</div>`:''}<div class="journal-spread"><section class="journal-timeline"><div class="journal-section-title"><h2>今日安排</h2><span>${count} / ${es.length} 已完成</span></div><div class="journal-ruled">${rows(es)}</div><div class="journal-completion">已完成 <b>${count}</b> / ${es.length}<button id="journalAdd" aria-label="添加今天的安排">＋ 记一件事</button></div></section><div class="journal-margin"><section class="journal-memo"><div class="journal-section-title"><h2>随手记</h2><button data-daily-memos>全部 ↗</button></div>${tasks.slice(0,5).map(n=>`<label class="journal-task"><input type="checkbox" data-memo-check="${esc(n.id)}"><span>${esc(n.title)}</span></label>`).join('')||'<p class="journal-empty-note">还没有待办。<br>想到什么，就记下来。</p>'}<button class="journal-text-button" data-daily-memos>＋ 添加备忘</button></section><section class="journal-margin-note"><span class="journal-note-label">今天的身体</span><details><summary>睡眠、跑步和训练记录</summary>${logForm()}</details></section><section class="journal-review-note"><span class="journal-note-label">下次称重</span><strong>${esc(fitnessDue())}</strong><p>同条件称重，也看看腰围和恢复。</p><button data-open-nutrition>打开10天复盘 ↗</button></section><figure class="journal-little-photo"><img src="assets/campus-court.jpg" alt="校园球场封面图" width="1536" height="1024" loading="lazy"><figcaption>课后，去球场走走。</figcaption></figure></div></div>`;
};
function journalDecorate(){
 document.body.classList.add('journal');
 const heading=app.querySelector('.pagehead');
 if(page==='training'){
  const intro=app.querySelector('.training-intro');if(intro)intro.innerHTML='<div><span class="journal-note-label">每周三练</span><h2>推、拉、腿。记得也要休息。</h2><p>中午训练，练完吃饭。动作和次数都在下面。</p></div><img class="journal-training-photo" src="assets/campus-court.jpg" alt="秋日校园球场氛围图" width="1536" height="1024">';
 }
 if(page==='notes'){
  const summary=app.querySelector('.memo-summary');if(summary){summary.querySelector('.eyebrow')?.remove();summary.querySelector('p').textContent='没做完的留着，每日任务每天重新勾选。';}
 }
 const pageSections=app.querySelectorAll('.eyebrow');pageSections.forEach(e=>e.hidden=true);
 // Replace template-style motivational copy with plain section labels.
 app.querySelectorAll('.workout-cover .eyebrow,.training-aside .eyebrow').forEach(e=>e.hidden=true);
 const photoTitle=$('#mealPhotos h2');if(photoTitle)photoTitle.textContent='今天吃了什么？';
 app.querySelectorAll('.review-banner .eyebrow').forEach(e=>e.hidden=true);
 const add=$('#journalAdd');if(add)add.onclick=()=>edit();
 if(page==='today'){
  const figure=app.querySelector('.journal-little-photo');
  if(figure){figure.innerHTML='<div class="journal-photo-empty"><span>今天的餐食</span><button id="journalOpenMeal">＋ 贴一张照片</button></div><figcaption>吃过的这一餐，也记下来。</figcaption>';$('#journalOpenMeal').onclick=()=>{uiFoodTab='photos';navigate('nutrition');};journalMealPhoto(figure,dailyRenderId,selected);}
 }
 if(heading)heading.dataset.journalHeading=page;
}
async function journalMealPhoto(figure,version,date){
 try{const photos=(await photoMetaFor(date)).filter(p=>!p.trashed),first=photos[0];if(!first)return;const file=await photoRead('files','get',first.id);if(!file?.blob||version!==dailyRenderId||page!=='today'||selected!==date)return;const url=URL.createObjectURL(file.blob);photoUrls.push(url);figure.innerHTML=`<a href="${url}" target="_blank" rel="noopener"><img src="${url}" alt="${esc(first.meal+' '+(first.caption||'餐食记录'))}"></a><figcaption>${esc(first.meal+' · '+(first.caption||'今天的一餐'))}</figcaption>`;}catch{}
}
render=()=>{journalBaseRender();journalDecorate();};
const journalNavIcons={today:'▦',week:'▤',training:'↗',nutrition:'◒',notes:'▧'};
document.querySelectorAll('nav [data-page]').forEach(b=>{b.innerHTML=`<span class="journal-nav-icon" aria-hidden="true">${journalNavIcons[b.dataset.page]||'·'}</span><span>${journalPageNames[b.dataset.page]||b.dataset.page}</span>`;});
document.querySelector('.brand').innerHTML='<b>日常有序<span class="journal-brand-mark"></span></b>';
document.querySelector('.navlabel').textContent='我的生活手帐';
document.querySelector('.sidebottom').innerHTML='<div class="journal-binding"><span></span><span></span><span></span></div><p>课上认真一点，<br>课后也去晒晒太阳。</p><small>一本自己的生活手帐</small>';
document.querySelector('meta[name="theme-color"]').content='#f3eee2';
render();
