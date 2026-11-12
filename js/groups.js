'use strict';
// Nhóm (group): gộp nhóm, tách nhóm, gom các phần thành đơn vị để căn chỉnh
// ---- Nhóm (group) ----
function leaveGroup(m){
  const g=m.userData.group; if(!g)return;
  g.members=g.members.filter(x=>x!==m); m.userData.group=null;
  if(g.members.length<2){g.members.forEach(x=>x.userData.group=null);groups=groups.filter(k=>k!==g)}
}
function groupSel(){
  const ms=parts.filter(p=>selSet.has(p)); if(ms.length<2)return;
  ms.forEach(leaveGroup);
  const g={name:'Nhóm '+(++gid),members:ms,locked:false,open:true}; groups.push(g); ms.forEach(m=>m.userData.group=g);
  finishSel(); push();
}
function ungroupSel(){
  const gs=new Set([...selSet].map(m=>m.userData.group).filter(Boolean)); if(!gs.size)return;
  gs.forEach(g=>g.members.forEach(m=>m.userData.group=null)); groups=groups.filter(g=>!gs.has(g));
  finishSel(); push();
}
function units(){ // mỗi nhóm chọn đủ thành viên là một đơn vị, các phần còn lại là đơn vị riêng
  const seen=new Set(), us=[];
  [...selSet].forEach(m=>{const g=m.userData.group; if(g&&g.members.every(x=>selSet.has(x))){if(!seen.has(g)){seen.add(g);us.push(g.members)}}else us.push([m])});
  return us;
}
$('grp').onclick=groupSel; $('ungrp').onclick=ungroupSel;
