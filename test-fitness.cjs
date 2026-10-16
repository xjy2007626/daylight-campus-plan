const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map(),memory=new Map();
function node(){return {dataset:{},style:{},classList:{toggle(){}},querySelectorAll(){return []},insertBefore(){},scrollIntoView(){},remove(){}}}
const document={querySelector(s){if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},querySelectorAll(){return []},createElement:node};
const context=vm.createContext({document,window:{addEventListener(){},scrollTo(){}},location:{hash:''},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},structuredClone,console,Intl,Date,URL,Blob,setTimeout:()=>0,clearTimeout(){},crypto:require('node:crypto').webcrypto});
vm.runInContext(fs.readFileSync('dist/app.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/fitness.js','utf8'),context);
vm.runInContext(`
const old=fitnessLegacyDefaults();
const oldLunch=old.events.find(e=>e.title==='午餐与放松');
oldLunch.title='我的午餐安排';
old.notes.push({id:'note-custom',title:'笔记',text:'保留'});
old.logs['2026-10-14']={sleep:'8',feeling:'很好'};
old.checks['2026-10-14|seed-1']=true;
old.events.push({id:'custom-event',day:0,start:'18:00',end:'18:20',title:'自定',type:'study',repeat:'weekly'});
globalThis.testOld=old;
globalThis.testMigrated=fitnessUpgrade(old);
`,context);
const run=s=>vm.runInContext(s,context);
assert.equal(run('validState(testMigrated)'),true);
assert.equal(run("testMigrated.events.some(e=>e.title==='我的午餐安排')"),true);
assert.equal(run("testMigrated.events.some(e=>e.id==='custom-event')"),true);
assert.equal(run('JSON.stringify(testMigrated.notes)===JSON.stringify(testOld.notes)'),true);
assert.equal(run('JSON.stringify(testMigrated.logs)===JSON.stringify(testOld.logs)'),true);
assert.equal(run('JSON.stringify(testMigrated.checks)===JSON.stringify(testOld.checks)'),true);
assert.equal(run('JSON.stringify(fitnessUpgrade(testMigrated))===JSON.stringify(testMigrated)'),true);
assert.equal(run('fitnessDue()'),'2026-10-25');
assert.equal(run("fitnessDateValid('2026-02-30')"),false);
assert.equal(run("fitnessDateValid('2028-02-29')"),true);
assert.equal(run("fitnessMealSummary({breakfastCost:'',lunchCost:'17',dinnerCost:'13'}).complete"),false);
assert.equal(run("fitnessMealSummary({breakfastCost:'0',lunchCost:'17',dinnerCost:'13'}).sum"),30);
assert.equal(run("fitnessMealSummary({breakfastCost:'0',lunchCost:'17',dinnerCost:'13'}).complete"),true);
run("state=defaults();state.health.reviews.push({date:'2026-10-14',weight:92,waist:''})");
assert.equal(run('fitnessDue()'),'2026-10-24');
assert.equal(run('state.health.profile.protein'),150);
assert.equal(run('state.health.profile.carbs'),250);
assert.equal(run("eventsFor('2026-10-24').filter(e=>e.fitnessReview).length"),1);
assert.equal(run("conflicts(eventsFor('2026-10-24')).length"),0);
run('state=defaults()');
for(const [date,name] of [['2026-10-20','推'],['2026-10-22','拉'],['2026-10-24','腿']]){
 assert.equal(run(`eventsFor('${date}').filter(e=>e.type==='gym').length`),1);
 assert.equal(run(`eventsFor('${date}').find(e=>e.type==='gym').start`),'12:00');
 assert.equal(run(`conflicts(eventsFor('${date}')).length`),0,`${name} day schedule conflicts`);
}
assert.ok(memory.has('daylight-campus-v1-before-fitness-v2'));
console.log('PASS: migration preserves edits/records, idempotence, date validation, 10-day recurrence, no automatic macro cuts, budget blanks/zero, noon timetable conflicts.');
vm.runInContext(fs.readFileSync('dist/daily.js','utf8'),context);
run(`state=defaults();selected='2026-10-16';state.notes=[
 {id:'once',title:'昨日没做完',text:'',date:'2026-10-15',kind:'task',repeat:'once'},
 {id:'daily',title:'每日任务',text:'',date:'2026-10-15',kind:'task',repeat:'daily'},
 {id:'future',title:'明天安排',text:'',date:'2026-10-17',kind:'task',repeat:'once'},
 {id:'old',title:'原有笔记',text:'知识点',date:'2026-10-14',category:'高数'},
 {id:'archived',title:'已归档',text:'',date:'2026-10-15',kind:'task',repeat:'once',archived:true}];
 state.memoChecks={'2026-10-15|daily':true};`);
assert.equal(run('validState(state)'),true);
assert.equal(run("memoDone(state.notes[1],'2026-10-15')"),true);
assert.equal(run("memoDone(state.notes[1],'2026-10-16')"),false);
assert.equal(run("memoItems().map(n=>n.id).join(',')"),'once,daily');
run("memoFilter='all'");
assert.equal(run('memoItems().length'),4);
assert.ok(run("notes().includes('原有笔记')"));
run("memoFilter='archived';memoSearch='不存在'");
assert.equal(run('memoItems().length'),0);
run("memoSearch='已归档'");
assert.equal(run("memoItems()[0].id"),'archived');
assert.equal(run("photoBytes(220*1024*1024)"),'220.0 MB');
console.log('PASS: daily task dates independent, unfinished tasks carry forward, future task excluded, legacy notes visible, archive/search filtering, photo capacity formatting.');
