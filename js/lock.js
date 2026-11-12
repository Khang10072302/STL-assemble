'use strict';
// Khóa (lock): kiểm tra khóa, biểu tượng ổ khóa, bật/tắt gizmo theo khóa
// ---- Khóa (lock) ----
function isLocked(m){return !!(m.userData.locked||(m.userData.group&&m.userData.group.locked))}
function selLocked(){return [...selSet].some(isLocked)}
function syncGizmo(){ // khóa hoặc đang tách rời thì không cho dùng gizmo
  if(sel&&sel.visible)tc.attach(sel); else tc.detach();
  tc.enabled=!!sel&&!exploded&&!selLocked();
}
function lockSvg(on){
  const c=on?'#ff5a5f':'#e8eaed', arc=on?'M8 11V8a4 4 0 0 1 8 0v3':'M8 11V8a4 4 0 0 1 7.5-2'; // khóa đóng màu đỏ, khóa mở màu trắng
  return '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="5" y="11" width="14" height="10" rx="2" fill="'+c+'"/><path d="'+arc+'" fill="none" stroke="'+c+'" stroke-width="2" stroke-linecap="round"/></svg>';
}
function lockBtn(getLocked,onToggle,disabled){
  const b=document.createElement('button'); b.className='lk'; b.innerHTML=lockSvg(getLocked());
  b.title=disabled?'Nhóm đang khóa':getLocked()?'Đang khóa, bấm để mở':'Bấm để khóa'; b.setAttribute('aria-label',b.title);
  b.onclick=()=>{if(disabled)return;onToggle();syncGizmo();renderList();fillFields();refreshAlign();push()}; return b;
}
