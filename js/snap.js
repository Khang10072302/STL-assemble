'use strict';
// Ghép theo điểm / mặt / cạnh, mối ghép (joint) và danh sách mối ghép
function renderJoints(){
  const ul=$('joints'); ul.innerHTML=''; $('noJoint').hidden=joints.length>0;
  const T={point:'điểm',face:'mặt',edge:'cạnh'};
  joints.forEach(j=>{
    const li=document.createElement('li'),c=document.createElement('input'),s=document.createElement('span'),x=document.createElement('button');
    c.type='checkbox'; c.checked=j.locked; c.title='Dính: di chuyển cùng nhau'; c.onchange=()=>{j.locked=c.checked;push()};
    s.style.flex=1; s.textContent=j.a.userData.name+' ↔ '+j.b.userData.name+' ('+T[j.mode]+')';
    x.textContent='×'; x.className='x'; x.title='Xóa mối ghép'; x.onclick=()=>{j.marker.removeFromParent();joints=joints.filter(k=>k!==j);renderJoints();push()};
    li.append(c,s,x); ul.append(li);
  });
}

// ---- Ghép theo điểm / mặt / cạnh ----
let snapMode=null, A=null; const H={point:'điểm',face:'mặt',edge:'cạnh'};
const hot=new THREE.MeshBasicMaterial({color:0xff2d55,depthTest:false}), jointMat=new THREE.MeshBasicMaterial({color:0x16a34a,depthTest:false});
const marker=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),hot); marker.renderOrder=9; marker.visible=false; scene.add(marker);
const edgeLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(1,0,0)]),new THREE.LineBasicMaterial({color:0xff2d55,depthTest:false})); edgeLine.renderOrder=9; edgeLine.visible=false; scene.add(edgeLine);
document.querySelectorAll('[data-snap]').forEach(b=>b.onclick=()=>{
  snapMode=snapMode===b.dataset.snap?null:b.dataset.snap; snapReset();
  document.querySelectorAll('[data-snap]').forEach(x=>x.classList.toggle('on',x.dataset.snap===snapMode));
  renderer.domElement.style.cursor=snapMode?'crosshair':'';
});
function snapReset(){A=null;marker.visible=false;edgeLine.visible=false;setHint()}
function setHint(){
  hint.textContent=!parts.length?'Thêm file STL để bắt đầu.':!snapMode?'Bấm vào một phần để chọn. Kéo chuột để xoay camera, cuộn để phóng to.'
   :!A?'Ghép '+H[snapMode]+' – bước 1: bấm một '+H[snapMode]+' trên phần đang chọn.':'Ghép '+H[snapMode]+' – bước 2: bấm '+H[snapMode]+' trên phần khác. Esc để hủy.';
}
const key=v=>Math.round(v.x*1e3)+','+Math.round(v.y*1e3)+','+Math.round(v.z*1e3);
const vert=(pos,i)=>new THREE.Vector3().fromBufferAttribute(pos,i);
const triN=(pos,t)=>{const a=vert(pos,t*3),b=vert(pos,t*3+1),c=vert(pos,t*3+2);return b.sub(a).cross(c.sub(a)).normalize()};
function edgeMap(m){ // cạnh -> các tam giác chứa nó (để biết cạnh nào là cạnh thật)
  if(m.userData.em)return m.userData.em;
  const pos=m.geometry.attributes.position, em=new Map();
  for(let t=0;t<pos.count/3;t++)for(let k=0;k<3;k++){
    const a=key(vert(pos,t*3+k)),b=key(vert(pos,t*3+(k+1)%3)),id=a<b?a+'|'+b:b+'|'+a;
    if(!em.has(id))em.set(id,[]); em.get(id).push(t);
  }
  return m.userData.em=em;
}
function feature(h,mode){
  const m=h.object,pos=m.geometry.attributes.position,t=h.faceIndex;
  const f={mode,obj:m,p:h.point.clone(),n:h.face.normal.clone().transformDirection(m.matrixWorld)};
  const W=[0,1,2].map(k=>vert(pos,t*3+k).applyMatrix4(m.matrixWorld));
  if(mode==='point'){ // hít vào đỉnh gần nhất nếu bấm đủ gần
    const L=Math.max(W[0].distanceTo(W[1]),W[1].distanceTo(W[2]),W[2].distanceTo(W[0]));
    const c=W.reduce((a,b)=>a.distanceTo(h.point)<b.distanceTo(h.point)?a:b);
    if(c.distanceTo(h.point)<.25*L)f.p=c.clone();
  }
  if(mode==='edge'){ // chọn cạnh nhọn gần điểm bấm nhất (bỏ qua đường chéo của mặt phẳng)
    const em=edgeMap(m),n0=triN(pos,t); let best=1e18;
    for(let k=0;k<3;k++){
      const a=key(vert(pos,t*3+k)),b=key(vert(pos,t*3+(k+1)%3)),tris=em.get(a<b?a+'|'+b:b+'|'+a);
      const o=tris.find(x=>x!==t), sharp=o===undefined||triN(pos,o).dot(n0)<.94;
      const seg=new THREE.Line3(W[k],W[(k+1)%3]), q=seg.closestPointToPoint(h.point,true,new THREE.Vector3());
      const sc=q.distanceTo(h.point)+(sharp?0:1e9);
      if(sc<best){best=sc;f.p=q;f.e0=W[k];f.e1=W[(k+1)%3]}
    }
  }
  return f;
}
function showA(f){
  marker.position.copy(f.p); marker.scale.setScalar(Math.max(.5,pxScale(f.p)*.55)); marker.visible=true;
  if(f.e0){edgeLine.geometry.setFromPoints([f.e0,f.e1]);edgeLine.visible=true}
}
function applySnap(a,b){
  const o=sel; beginMove();
  let q=null;
  if(a.mode==='face'||(a.mode==='point'&&$('alignFace').checked))q=new THREE.Quaternion().setFromUnitVectors(a.n,b.n.clone().negate());
  if(a.mode==='edge'){const da=a.e1.clone().sub(a.e0).normalize(),db=b.e1.clone().sub(b.e0).normalize();q=new THREE.Quaternion().setFromUnitVectors(da,da.dot(db)<0?db.negate():db)}
  if(q){o.quaternion.premultiply(q);a.p.sub(o.position).applyQuaternion(q).add(o.position)}
  let d=b.p.clone().sub(a.p); if(a.mode==='face')d=b.n.clone().multiplyScalar(d.dot(b.n)); // mặt: chỉ áp sát, không trượt ngang
  o.position.add(d); o.userData.stick=false; propagate(); o.updateMatrixWorld(true);
  const w=a.p.clone().add(d), size=new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3());
  const mk=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),jointMat); mk.renderOrder=9;
  mk.position.copy(o.worldToLocal(w)); mk.scale.setScalar(Math.max(size.x,size.y,size.z)/60/o.scale.x); o.add(mk);
  joints.push({a:o,b:b.obj,mode:a.mode,locked:true,marker:mk});
  fillFields(); renderJoints(); snapReset(); push();
}
const ray=new THREE.Raycaster(), mouse=new THREE.Vector2(); let down=null, onGizmo=false;
const cv=renderer.domElement;
cv.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];onGizmo=tc.axis!==null});
cv.addEventListener('pointerup',e=>{
  if(!down||onGizmo||Math.hypot(e.clientX-down[0],e.clientY-down[1])>4)return;
  const r=cv.getBoundingClientRect(); mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); ray.setFromCamera(mouse,camera);
  if(alignHit())return;
  const vis=parts.filter(m=>m.visible), more=e.shiftKey||e.ctrlKey||e.metaKey;
  if(!snapMode||exploded){const h=ray.intersectObjects(vis)[0];if(!h&&more)return;select(h?h.object:null,more,e.altKey);return}
  if(!sel)return;
  if(selLocked()){hint.textContent='Phần đang chọn đang khóa, mở khóa để ghép.';return}
  const h=ray.intersectObjects(A?vis.filter(m=>m!==sel):[sel])[0]; if(!h)return;
  const f=feature(h,snapMode);
  if(!A){A=f;showA(f);setHint();return}
  applySnap(A,f);
});
