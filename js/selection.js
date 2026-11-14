'use strict';
// Chọn phần: chọn một, chọn thêm (Shift/Ctrl), chọn nhóm, đồng bộ gizmo, targets() cho thao tác hàng loạt
// ---- Chọn phần / nhóm ----
function targets(m){return selSet.has(m)&&selSet.size>1?[...selSet]:[m]} // phần được bấm nằm trong vùng chọn thì áp dụng cho cả vùng chọn
function expand(m,single){return m.userData.group&&!single?m.userData.group.members:[m]}
let editGroup=null; // đang ở chế độ chọn từng chi tiết trong nhóm này (nhấn đúp vào chi tiết của nhóm để vào)
function setOutline(p,color){ // viền xanh ngọc quanh chi tiết (các cạnh sắc nét), color=null để bỏ viền
  let o=p.userData.outline;
  if(color===null){if(o&&o.parent)p.remove(o);return}
  if(!o){
    if(p.geometry.attributes.position.count>600000)return; // lưới quá nặng thì chỉ dùng màu phát sáng
    o=new THREE.LineSegments(new THREE.EdgesGeometry(p.geometry,30),new THREE.LineBasicMaterial({color}));
    o.renderOrder=4; o.raycast=()=>{}; p.userData.outline=o;
  }
  o.material.color.set(color); if(o.parent!==p)p.add(o);
}
function applyHighlight(){
  parts.forEach(p=>{
    const on=selSet.has(p), dim=!on&&!!editGroup&&p.userData.group===editGroup; // dim: chi tiết khác của nhóm đang chọn từng phần
    p.material.emissive.set(on?0x0f5c54:dim?0x06302c:0);
    p.material.polygonOffset=true; p.material.polygonOffsetFactor=1; p.material.polygonOffsetUnits=1; // để viền không bị chìm vào mặt
    setOutline(p,on?0x5eead4:dim?0x2b8f86:null);
  });
}
function finishSel(){
  if(editGroup&&!groups.includes(editGroup))editGroup=null;
  applyHighlight();
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
  list.forEach(m=>expand(m,!!editGroup&&m.userData.group===editGroup).forEach(x=>selSet.add(x)));
  sel=list.length?list[list.length-1]:sel; if(!sel||!selSet.has(sel))sel=[...selSet].pop()||null;
  finishSel();
}
