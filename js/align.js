'use strict';
// Căn chỉnh (Align) kiểu Tinkercad: hộp bao, chấm Min/Giữa/Max, nút căn
// ---- Căn chỉnh (Align) kiểu Tinkercad: chọn nhiều phần, bấm chấm trên hộp bao để căn theo Min / Giữa / Max của từng trục ----
let alignOn=false;
const alignGroup=new THREE.Group(); alignGroup.visible=false; scene.add(alignGroup);
const alignBox=new THREE.Box3Helper(new THREE.Box3(),0x5eead4); alignBox.material.depthTest=false; alignBox.renderOrder=9; alignGroup.add(alignBox);
const MODES=['min','mid','max'], AXCOL=[0xe5484d,0x30a46c,0x3e63dd];
const handles=[]; AXCOL.forEach((c,ax)=>MODES.forEach(m=>{
  const h=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),new THREE.MeshBasicMaterial({color:c,depthTest:false}));
  h.renderOrder=10; h.userData={ax,mode:m}; alignGroup.add(h); handles.push(h);
}));
function worldBox(m){ // hộp bao thật sự của phần (tính trên từng đỉnh)
  m.updateMatrixWorld(true); const e=m.matrixWorld.elements,p=m.geometry.attributes.position.array;
  let a=1e30,b=a,c=a,A=-a,B=-a,C=-a;
  for(let i=0;i<p.length;i+=3){
    const x=p[i],y=p[i+1],z=p[i+2], X=e[0]*x+e[4]*y+e[8]*z+e[12], Y=e[1]*x+e[5]*y+e[9]*z+e[13], Z=e[2]*x+e[6]*y+e[10]*z+e[14];
    if(X<a)a=X;if(X>A)A=X;if(Y<b)b=Y;if(Y>B)B=Y;if(Z<c)c=Z;if(Z>C)C=Z;
  }
  return new THREE.Box3(new THREE.Vector3(a,b,c),new THREE.Vector3(A,B,C));
}
const pick=(b,mode,ax)=>mode==='min'?b.min.getComponent(ax):mode==='max'?b.max.getComponent(ax):(b.min.getComponent(ax)+b.max.getComponent(ax))/2;
function refreshAlign(){
  const ms=[...selSet], ok=units().length>1&&!exploded, on=alignOn&&ok;
  $('alignBtn').classList.toggle('on',alignOn); $('alignBtn').textContent=alignOn?'Tắt căn chỉnh':'Bật căn chỉnh';
  $('alignInfo').textContent=ms.length+' chi tiết đang chọn';
  $('alignHint').textContent=!ok?'Chọn ít nhất 2 chi tiết để căn chỉnh.':ms.some(isLocked)?'Chi tiết bị khóa là mốc, các chi tiết còn lại căn theo nó.':'Bấm vào chấm trên hộp bao hoặc chọn vị trí căn ở trên.';
  document.querySelectorAll('[data-al],[data-axis]').forEach(b=>b.disabled=!ok);
  alignGroup.visible=on; if(!on)return;
  const us=units(), lku=us.filter(u=>u.some(isLocked)), U=new THREE.Box3(); (lku.length?lku:us).forEach(u=>u.forEach(m=>U.union(worldBox(m)))); alignBox.box.copy(U);
  const off=U.getSize(new THREE.Vector3()).length()*.06;
  handles.forEach(h=>{const {ax,mode}=h.userData, t=pick(U,mode,ax);
    if(ax===0)h.position.set(t,U.min.y-off,U.min.z-off); else if(ax===1)h.position.set(U.max.x+off,t,U.min.z-off); else h.position.set(U.max.x+off,U.min.y-off,t)});
}
function alignAxis(ax,mode){
  const us=units(); if(us.length<2||exploded)return;
  const bs=us.map(u=>{const b=new THREE.Box3();u.forEach(m=>b.union(worldBox(m)));return b}), lk=us.map(u=>u.some(isLocked)), anyLk=lk.some(Boolean);
  const U=new THREE.Box3(); bs.forEach((b,i)=>{if(!anyLk||lk[i])U.union(b)}); const ref=pick(U,mode,ax); // có phần khóa thì lấy chúng làm mốc
  const ds=bs.map(b=>ref-pick(b,mode,ax)); // tính hết trước rồi mới dời
  us.forEach((u,i)=>{
    const d=ds[i]; if(lk[i]||Math.abs(d)<1e-9)return;
    const nb=new Set(); u.forEach(m=>{m.position.setComponent(ax,m.position.getComponent(ax)+d); if(ax===2)m.userData.stick=false; groupOf(m).forEach(o=>{if(!selSet.has(o)&&!isLocked(o))nb.add(o)})});
    nb.forEach(o=>o.position.setComponent(ax,o.position.getComponent(ax)+d)); // các phần đang dính với nó đi theo
  });
  fillFields(); push();
}
function alignHit(){ // bấm vào chấm trên khung nhìn
  if(!alignGroup.visible)return false;
  const h=ray.intersectObjects(handles)[0]; if(!h)return false;
  alignAxis(h.object.userData.ax,h.object.userData.mode); return true;
}
let alignAxisSel=0; // trục đang chọn (0=X, 1=Y, 2=Z); bấm Đầu/Giữa/Cuối là căn ngay theo trục này
document.querySelectorAll('[data-axis]').forEach(b=>b.onclick=()=>{alignAxisSel=+b.dataset.axis;document.querySelectorAll('[data-axis]').forEach(x=>x.classList.toggle('on',x===b))});
document.querySelectorAll('[data-al]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-al]').forEach(x=>x.classList.toggle('on',x===b));alignAxis(alignAxisSel,b.dataset.al)});
$('alignBtn').onclick=()=>{alignOn=!alignOn;refreshAlign()};
function selectAllParts(){const v=parts.filter(p=>p.visible);if(!v.length)return;select(v[0]);v.slice(1).forEach(p=>select(p,true))}
$('selAll').onclick=selectAllParts;
const prevDraw=window.vcDraw;
window.vcDraw=()=>{prevDraw();if(alignGroup.visible)handles.forEach(h=>h.scale.setScalar(pxScale(h.position)))};
