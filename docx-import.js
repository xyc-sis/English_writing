(function(root){
'use strict';
const W='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const text=n=>Array.from(n.getElementsByTagNameNS(W,'*')).filter(x=>['t','br','cr','tab'].includes(x.localName)).map(x=>x.localName==='t'?x.textContent:x.localName==='tab'?' ':'\n').join('').trim();
const chinese=s=>/[\u3400-\u9fff]/.test(s),english=s=>/[a-zA-Z]/.test(s)&&!chinese(s);
function parseXML(xml,source){
 const doc=new DOMParser().parseFromString(xml,'application/xml');if(doc.querySelector('parsererror'))throw Error('Word 文档内容损坏');
 const body=doc.getElementsByTagNameNS(W,'body')[0];if(!body)throw Error('未找到 Word 正文');
 const blocks=Array.from(body.children),items=[];let category='核心表达',last=null;
 const add=(answer,prompt,note='',cat=category)=>{answer=answer.replace(/^\d+[.、．]?\s+/,'').trim();prompt=prompt.trim();if(!english(answer)||!chinese(prompt))return null;const x={answer,prompt,category:cat,source,note,example:''};items.push(x);return x;};
 for(let i=0;i<blocks.length;i++){
  const block=blocks[i];
  if(block.localName==='tbl'){
   for(const row of Array.from(block.children).filter(n=>n.localName==='tr')){const cells=Array.from(row.children).filter(n=>n.localName==='tc').map(text);for(let k=0;k+1<cells.length;k+=2){const a=cells[k],b=cells[k+1];if(a.includes('/')&&b.includes('／')){const aa=a.split('/'),bb=b.split('／');if(aa.length===bb.length){aa.forEach((v,j)=>add(v,bb[j]));continue;}}add(a,b);}}
   last=null;continue;
  }
  if(block.localName!=='p')continue;const s=text(block);if(!s)continue;
  if(/^[一二三四五六七八九十]+[\s、．.]/.test(s)){category=s.replace(/^[一二三四五六七八九十]+[\s、．.]+/,'').replace(/与例句$/,'');last=null;continue;}
  if(/^\d+[.、．]?\s+/.test(s)&&english(s)){const next=blocks[i+1];const meaning=next?.localName==='p'?text(next):'';if(chinese(meaning)){const [prompt,...note]=meaning.split(/[；;]/);last=add(s,prompt,note.join('；'));i++;}continue;}
  const clean=s.replace(/^(?:补充例句|例句)\s*/,'');
  const lines=clean.split(/\n+/).map(v=>v.trim()).filter(Boolean);
  if(lines.length>=2&&english(lines[0])&&chinese(lines[1])){if(last){last.example+=(last.example?'\n\n':'')+lines.join('\n');}else if(!/^(?:补充例句|例句)/.test(s)){add(lines[0],lines[1],'','图表句式');}else {for(const x of items){if(lines[0].toLowerCase().includes(x.answer.toLowerCase()))x.example=lines.join('\n');}}continue;}

  if(english(clean)&&blocks[i+1]?.localName==='p'&&chinese(text(blocks[i+1]))){const translation=text(blocks[++i]);if(last){last.example+=(last.example?'\n\n':'')+clean+'\n'+translation;}else if(!/^(?:补充例句|例句)/.test(s)){add(clean,translation,'','图表句式');}}
 }
 const result=root.SpellingCore.merge([],items);if(!result.length)throw Error('没有识别到表达。请使用“英文＋中文”两列表格，或编号英文表达后跟中文释义');return result;
}
async function read(file){if(file.size>10*1024*1024)throw Error('文件不能超过 10 MB');const zip=await JSZip.loadAsync(await file.arrayBuffer());const doc=zip.file('word/document.xml');if(!doc)throw Error('请选择 .docx 格式的 Word 文档');if(doc._data?.uncompressedSize>8*1024*1024)throw Error('文档正文过大');return parseXML(await doc.async('string'),file.name.replace(/\.docx$/i,''));}
root.DocxExpressions={read,parseXML};
})(globalThis);
