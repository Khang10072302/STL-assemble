'use strict';
// Hoàn tác / làm lại (snapshot vị trí, màu, chất liệu, khóa, nhóm, mối ghép)
// ---- Hoàn tác / làm lại ----
let hist=[], hi=-1;
function snapshot(){return{parts:parts.map(m=>({m,p:(m.userData.base||m.position).clone(),q:m.quaternion.clone(),s:m.scale.clone(),c:m.material.color.getHex(),v:m.visible,k:m.userData.mat,st:m.userData.stick,lk:m.userData.locked})),groups:groups.map(g=>({g,name:g.name,members:[...g.members],locked:g.locked,open:g.open})),joints:joints.map(j=>({...j})),sel}}
function push(){hist=hist.slice(0,hi+1);hist.push(snapshot());hi=hist.length-1;updUndo();refreshAlign()}
function restore(s){
  parts.forEach(m=>scene.remove(m)); parts.length=0;
  s.parts.forEach(o=>{const m=o.m;m.position.copy(o.p);m.quaternion.copy(o.q);m.scale.copy(o.s);m.material.color.setHex(o.c);m.visible=o.v;setMat(m,o.k);m.userData.stick=o.st;m.userData.locked=o.lk;scene.add(m);parts.push(m)});
  joints.forEach(j=>j.marker.removeFromParent()); joints=s.joints.map(j=>({...j})); joints.forEach(j=>j.a.add(j.marker));
  parts.forEach(p=>p.userData.group=null); groups=s.groups.map(o=>{const g=o.g;g.name=o.name;g.members=[...o.members];g.locked=o.locked;g.open=o.open;g.members.forEach(m=>m.userData.group=g);return g});
  select(parts.includes(s.sel)?s.sel:parts[0]||null);
}
function undo(){if(exploded)return;if(hi>0){restore(hist[--hi]);updUndo()}}
function redo(){if(exploded)return;if(hi<hist.length-1){restore(hist[++hi]);updUndo()}}
function updUndo(){$('undo').disabled=exploded||hi<=0;$('redo').disabled=exploded||hi>=hist.length-1}
$('undo').onclick=undo; $('redo').onclick=redo;
