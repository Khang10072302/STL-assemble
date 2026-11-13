'use strict';
// Xóa phần: Delete/Backspace xóa mọi phần đang chọn (phần bị khóa được giữ lại)
function deleteParts(list){
  if(exploded)return;
  const del=[...new Set(list)].filter(m=>!isLocked(m)), kept=new Set(list).size-del.length;
  if(del.length){
    const set=new Set(del);
    joints.filter(j=>set.has(j.a)||set.has(j.b)).forEach(j=>j.marker.removeFromParent());
    joints=joints.filter(j=>!set.has(j.a)&&!set.has(j.b));
    del.forEach(m=>{leaveGroup(m);scene.remove(m);parts.splice(parts.indexOf(m),1)});
    tc.detach(); select(null); push();
  }
  if(kept)hint.textContent=kept+' phần đang khóa nên không bị xóa. Mở khóa rồi xóa lại.';
}
function deleteSelected(){deleteParts([...selSet])}
