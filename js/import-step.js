'use strict';
// Đọc file STEP bằng occt-import-js (WebAssembly, tải từ CDN khi cần)
// ---- Đọc STEP bằng occt-import-js (WebAssembly), tải khi cần ----
let occtP=null;
function loadOcct(){
  if(occtP)return occtP;
  const base='https://cdn.jsdelivr.net/npm/occt-import-js@0.0.23/dist/';
  return occtP=new Promise((res,rej)=>{
    const sc=document.createElement('script'); sc.src=base+'occt-import-js.js';
    sc.onload=()=>occtimportjs({locateFile:n=>base+n}).then(res,rej);
    sc.onerror=()=>rej(new Error('không tải được bộ đọc STEP (cần internet)'));
    document.head.append(sc);
  }).catch(e=>{occtP=null;throw e});
}
async function fromSTEP(name,buf){
  hint.textContent='Đang đọc file STEP, có thể mất vài giây…';
  const occt=await loadOcct(), r=occt.ReadStepFile(new Uint8Array(buf),null);
  if(!r.success||!r.meshes.length)throw new Error('không đọc được hình học STEP');
  const base=name.replace(/\.(step|stp)$/i,'');
  return r.meshes.map((m,i)=>{
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(m.attributes.position.array),3));
    if(m.index)g.setIndex(new THREE.BufferAttribute(new Uint32Array(m.index.array),1));
    const col=m.color?new THREE.Color(m.color[0],m.color[1],m.color[2]).getHex():undefined;
    return makePart(r.meshes.length===1?base:(m.name?base+' – '+m.name:base+' '+(i+1)),g,col);
  });
}
