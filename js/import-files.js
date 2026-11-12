'use strict';
// Chọn file / kéo thả file, gọi đúng bộ đọc theo đuôi file (.stl, .3mf, .step, .stp)
async function loadFiles(files){
  if(exploded)setExplode(0);
  let any=false;
  for(const f of files){
    let ms=[];
    try{
      if(/\.stl$/i.test(f.name))ms=fromSTL(f.name,await f.arrayBuffer());
      else if(/\.3mf$/i.test(f.name))ms=from3MF(f.name,await f.arrayBuffer());
      else if(/\.(step|stp)$/i.test(f.name))ms=await fromSTEP(f.name,await f.arrayBuffer());
      else continue;
    }catch(e){console.error(e);setHint();alert('Không đọc được '+f.name+': '+(e.message||e));continue}
    if(ms.length){place(ms);select(ms[0]);any=true}
  }
  if(any){frame();push()}
}
$('file').onchange=e=>{loadFiles(e.target.files);e.target.value=''};
const drop=$('drop');
['dragover','dragenter'].forEach(t=>addEventListener(t,e=>{e.preventDefault();drop.classList.add('over')}));
['dragleave','drop'].forEach(t=>addEventListener(t,e=>{e.preventDefault();drop.classList.remove('over')}));
addEventListener('drop',e=>{e.preventDefault();loadFiles(e.dataTransfer.files)});
