'use strict';
// Di chuyển cả nhóm: beginMove, groupOf, propagate (các phần chọn cùng và các phần dính cùng đi theo)
// ---- Nhóm dính: các phần đã ghép (đang bật "Dính") di chuyển cùng nhau ----
function beginMove(){sel.updateMatrix();lastM=sel.matrix.clone()}
function groupOf(m){const g=new Set([m]);if(selSet.has(m))selSet.forEach(x=>g.add(x));let ch=true;while(ch){ch=false;joints.forEach(j=>{if(j.locked&&g.has(j.a)!==g.has(j.b)){g.add(j.a);g.add(j.b);ch=true}})}return g}
function propagate(){
  if(sel.userData.stick!==false)dropToPlane(sel);
  sel.updateMatrix(); const d=new THREE.Matrix4().multiplyMatrices(sel.matrix,lastM.clone().invert());
  groupOf(sel).forEach(o=>{if(o!==sel&&!isLocked(o)){o.updateMatrix();o.matrix.premultiply(d);o.matrix.decompose(o.position,o.quaternion,o.scale)}});
  lastM.copy(sel.matrix);
}
