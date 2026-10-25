(function(root){
'use strict';
const normalize=s=>String(s).normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/(?:\.{1,3}|…|[。!?！？，,;；:：])+$/g,'').trim().replace(/\s+/g,' ');
const identity=x=>JSON.stringify([normalize(x.answer),x.prompt.trim()]);
function validate(items){
 if(!Array.isArray(items)||items.length>3000)throw Error('表达列表格式错误或超过 3000 条');
 return items.map(x=>{if(!x||typeof x.prompt!=='string'||!x.prompt.trim()||typeof x.answer!=='string'||!x.answer.trim()||x.answer.length>1000||x.prompt.length>2000)throw Error('每条表达需要中文提示和唯一英文答案');
 return {id:identity(x),prompt:x.prompt.trim(),answer:x.answer.trim(),category:String(x.category||'未分类').slice(0,100),source:String(x.source||'导入表达').slice(0,200),note:String(x.note||'').slice(0,3000),example:String(x.example||'').slice(0,3000)};});
}
function merge(old,items){const map=new Map(old.map(x=>[x.id,x]));validate(items).forEach(x=>map.set(x.id,x));return [...map.values()];}
// Token alignment highlights missing, extra and misspelled words without accepting alternatives.
function diff(input,answer){const a=normalize(input).split(' ').filter(Boolean),b=normalize(answer).split(' ').filter(Boolean);const d=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
 for(let i=0;i<=a.length;i++)d[i][0]=i;for(let j=0;j<=b.length;j++)d[0][j]=j;
 for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
 let i=a.length,j=b.length,out=[];while(i||j){if(i&&j&&d[i][j]===d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)){out.unshift({kind:a[i-1]===b[j-1]?'same':'replace',from:a[--i],to:b[--j]});}else if(j&&d[i][j]===d[i][j-1]+1){out.unshift({kind:'missing',to:b[--j]});}else out.unshift({kind:'extra',from:a[--i]});}return out;
}
function grade(previous,clean,now=Date.now()){const level=clean?Math.min((previous?.level||0)+1,4):0;return {level,due:now+(clean?[0,1,3,7,15][level]*86400000:600000),reviewedAt:now,needsReview:!clean,attempts:(previous?.attempts||0)+1,mistakes:(previous?.mistakes||0)+(clean?0:1)};}
function validateProgress(p){if(!p||typeof p!=='object'||Array.isArray(p))throw Error('拼写进度格式错误');const result={};for(const [k,v] of Object.entries(p)){if(!v||!Number.isInteger(v.level)||v.level<0||v.level>4||!Number.isFinite(v.due)||!Number.isFinite(v.reviewedAt)||!Number.isInteger(v.attempts)||v.attempts<0||!Number.isInteger(v.mistakes)||v.mistakes<0||typeof v.needsReview!=='boolean')throw Error('拼写进度格式错误');result[k]=v;}return result;}
const api={normalize,identity,validate,merge,diff,grade,validateProgress};if(typeof module!=='undefined')module.exports=api;else root.SpellingCore=api;
})(globalThis);
