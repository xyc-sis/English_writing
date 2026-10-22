(function(root){
'use strict';
const text=(v,name)=>{if(typeof v!=='string'||!v.trim())throw Error(name+' 必须是非空文本');};
function validatePack(p){
 if(!p||p.schemaVersion!==1||!Array.isArray(p.essays)||!p.essays.length)throw Error('需要 schemaVersion: 1 和非空 essays 数组');
 const ids=new Set();
 for(const e of p.essays){
  for(const k of ['id','title','prompt','model','form'])text(e[k],k);
  if(ids.has(e.id))throw Error('作文 ID 重复');ids.add(e.id);
  if(!['large','small'].includes(e.type))throw Error('type 应为 large 或 small');
  if(!Array.isArray(e.topics)||!e.topics.length||e.topics.some(t=>typeof t!=='string'||!t.trim()))throw Error('topics 需要非空话题数组');
  if(e.type==='small')text(e.task,'小作文 task');
  if(!Array.isArray(e.original)||!e.original.length)throw Error('original 需要原稿段落');
  e.original.forEach(x=>{text(x.text,'原稿');if(!['self','template','adapted','unmarked'].includes(x.source))throw Error('未知原稿来源标签');});
  for(const k of ['corrections','points','cards','exercises'])if(!Array.isArray(e[k]))throw Error(k+' 需要数组');
  e.corrections.forEach(x=>['before','after','reason'].forEach(k=>text(x[k],k)));
  e.points.forEach(x=>['title','explanation','example','scope'].forEach(k=>text(x[k],k)));
  for(const kind of ['cards','exercises']){const seen=new Set();e[kind].forEach(x=>{for(const k of ['id','prompt','answer','usage'])text(x[k],k);if(seen.has(x.id))throw Error('卡片或练习 ID 重复');seen.add(x.id);if(kind==='exercises'&&!['exact','open'].includes(x.kind))throw Error('练习 kind 应为 exact 或 open');});}
 }
 return p;
}
const key=(e,k,id)=>JSON.stringify([e,k,id]);
function merge(state,pack){validatePack(pack);const map=new Map(state.essays.map(e=>[e.id,e]));pack.essays.forEach(e=>map.set(e.id,e));return {...state,essays:[...map.values()]};}
function normalize(s){return s.trim().replace(/\s+/g,' ').toLowerCase();}
function grade(previous,rating,now=Date.now()){const level=rating==='会了'?Math.min((previous?.level||0)+1,4):0;const days=[0,1,3,7,15][level];return {...previous,rating,level,due:now+(days?days*86400000:600000),reviewedAt:now};}
const api={validatePack,merge,key,normalize,grade};if(typeof module!=='undefined')module.exports=api;else root.EssayCore=api;
})(globalThis);
