'use strict';
// Exploded view: tách các phần ra xa nhau để xem cấu trúc bên trong
// ---- Exploded view: dịch chuyển hiển thị, vị trí ghép thật được giữ trong userData.base ----
let exMode='radial';
const EX_SCALE=3; // hệ số khoảng cách tách (1 = bản đầu tiên)
function computeOffsets(){
  parts.forEach(m=>{if(m.userData.base)m.position.copy(m.userData.base);m.updateMatrixWorld(true);m.userData.off=new THREE.Vector3()});
  const vis=parts.filter(m=>m.visible); if(!vis.length)return;
  const box=new THREE.Box3(); vis.forEach(m=>box.expandByObject(m));
  const C=box.getCenter(new THREE.Vector3()), S=Math.max(box.getSize(new THREE.Vector3()).length(),1);
  const ctr=new Map(vis.map(m=>[m,new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3())]));
  if(exMode==='radial'){
    vis.forEach((m,i)=>{const v=ctr.get(m).clone().sub(C); if(v.length()<S*1e-3)v.set(0,0,(i-(vis.length-1)/2)||1); m.userData.off.copy(v.normalize().multiplyScalar(S*.4*EX_SCALE))});
  }else{
    const ax={x:0,y:1,z:2}[exMode], gap=S*.6*EX_SCALE/Math.max(vis.length-1,1); // xếp theo thứ tự dọc trục, các phần trùng tâm vẫn tách ra được
    [...vis].sort((a,b)=>ctr.get(a).getComponent(ax)-ctr.get(b).getComponent(ax)).forEach((m,i)=>m.userData.off.setComponent(ax,(i-(vis.length-1)/2)*gap));
  }
}
function applyEx(f){parts.forEach(m=>{if(m.userData.base)m.position.copy(m.userData.base).addScaledVector(m.userData.off,f)})}
function setExplode(f){
  const was=exploded;
  if(f>0&&!was){parts.forEach(m=>m.userData.base=m.position.clone());computeOffsets()}
  if(f<=0&&was)parts.forEach(m=>{if(m.userData.base){m.position.copy(m.userData.base);delete m.userData.base}});
  exploded=f>0; if(exploded)applyEx(f);
  $('explode').value=exploded?f:0; uiExPct(); syncGizmo();
  fillFields(); updUndo();
}
let exAxis='z';
function uiExPct(){$('exPct').textContent=Math.round(+$('explode').value*100)+'%'}
function setExMode(m){ // m: 'radial' hoặc 'x' | 'y' | 'z'
  exMode=m; $('exMode').value=m==='radial'?'radial':'axis';
  document.querySelectorAll('[data-exaxis]').forEach(b=>b.classList.toggle('on',m!=='radial'&&b.dataset.exaxis===m));
  if(exploded){computeOffsets();applyEx(+$('explode').value)}
}
$('explode').oninput=e=>setExplode(+e.target.value);
$('exMode').onchange=e=>setExMode(e.target.value==='radial'?'radial':exAxis);
document.querySelectorAll('[data-exaxis]').forEach(b=>b.onclick=()=>{exAxis=b.dataset.exaxis;setExMode(exAxis)});
