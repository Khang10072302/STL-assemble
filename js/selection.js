'use strict';
// Chọn phần: chọn một, chọn thêm (Shift/Ctrl), chọn nhóm, đồng bộ gizmo, targets() cho thao tác hàng loạt
// ---- Chọn phần / nhóm ----
function targets(m){return selSet.has(m)&&selSet.size>1?[...selSet]:[m]} // phần được bấm nằm trong vùng chọn thì áp dụng cho cả vùng chọn
function expand(m,single){return m.userData.group&&!single?m.userData.group.members:[m]}
function finishSel(){
  parts.forEach(p=>p.material.emissive.set(selSet.has(p)?0x10304f:0));
  syncGizmo(); renderList(); fillFields(); setHint(); refreshAlign();
}
function select(m,add,single){ // add: giữ Shift/Ctrl để chọn thêm; single: chọn riêng một phần trong nhóm
  const ms=m?expand(m,single):[];
  if(add&&m){if(selSet.has(m)&&selSet.size>ms.length){ms.forEach(x=>selSet.delete(x));m=[...selSet].pop()}else ms.forEach(x=>selSet.add(x))}
  else{selSet.clear();ms.forEach(x=>selSet.add(x))}
  sel=m; finishSel();
}
function setSelection(list,add){
  if(!add)selSet.clear();
  list.forEach(m=>expand(m,false).forEach(x=>selSet.add(x)));
  sel=list.length?list[list.length-1]:sel; if(!sel||!selSet.has(sel))sel=[...selSet].pop()||null;
  finishSel();
}
