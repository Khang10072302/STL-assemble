'use strict';
// Danh sách các phần (có nhóm, ổ khóa, màu, ẩn/hiện); thao tác trên một phần đang chọn áp dụng cho cả vùng chọn
function remove(m){deleteParts(targets(m))} // nút × trên dòng; nếu phần đó đang được chọn cùng nhiều phần thì xóa cả vùng chọn
function colorFor(m,hex){targets(m).forEach(p=>p.material.color.set(hex))}
function visibleFor(m,v){targets(m).forEach(p=>p.visible=v)}
// ---- Danh sách các phần (có nhóm và ổ khóa) ----
function partRow(m,indent){
  const li=document.createElement('li'); li.className=(selSet.has(m)?'sel ':'')+(indent?'in':'');
  const c=document.createElement('input'); c.type='color'; c.value='#'+m.material.color.getHexString(); c.title='Đổi màu'; c.oninput=()=>colorFor(m,c.value); c.onchange=()=>{renderList();push()};
  const b=document.createElement('button'); b.className='name'; b.textContent=m.userData.name; b.onclick=e=>select(m,e.ctrlKey||e.metaKey||e.shiftKey,true);
  const v=document.createElement('input'); v.type='checkbox'; v.checked=m.visible; v.title='Hiện/ẩn'; v.onchange=()=>{visibleFor(m,v.checked);syncGizmo();renderList();push()};
  const x=document.createElement('button'); x.className='x'; x.textContent='×'; x.title='Xóa'; x.onclick=()=>remove(m);
  const lk=lockBtn(()=>isLocked(m),()=>toggleLockFor(m),!!(m.userData.group&&m.userData.group.locked));
  li.append(c,b,v,lk,x); return li;
}
function groupRow(g){
  const li=document.createElement('li'); li.className='grp'+(g.members.every(m=>selSet.has(m))?' sel':'');
  const tg=document.createElement('button'); tg.className='tg'; tg.textContent=g.open?'▾':'▸'; tg.title=g.open?'Thu gọn':'Mở rộng'; tg.onclick=()=>{g.open=!g.open;renderList()};
  const b=document.createElement('button'); b.className='name'; b.textContent='▣ '+g.name+' ('+g.members.length+')'; b.title='Bấm để chọn cả nhóm, bấm đúp để đổi tên';
  b.onclick=()=>setSelection(g.members.slice(),false); b.ondblclick=()=>{const n=prompt('Tên nhóm',g.name);if(n&&n.trim()){g.name=n.trim();renderList();push()}};
  const v=document.createElement('input'); v.type='checkbox'; v.checked=g.members.some(m=>m.visible); v.title='Hiện/ẩn cả nhóm'; v.onchange=()=>{setGroupVisible(g,v.checked);syncGizmo();renderList();push()};
  const lk=lockBtn(()=>g.locked,()=>toggleGroupLock(g),false);
  const x=document.createElement('button'); x.className='x'; x.textContent='⤢'; x.title='Tách nhóm'; x.onclick=()=>{g.members.forEach(m=>m.userData.group=null);groups=groups.filter(k=>k!==g);finishSel();push()};
  li.append(tg,b,v,lk,x); return li;
}
function renderList(){
  const ul=$('list'); ul.innerHTML=''; $('empty').hidden=parts.length>0; renderJoints();
  const done=new Set();
  parts.forEach(m=>{
    const g=m.userData.group; if(!g){ul.append(partRow(m,false));return}
    if(done.has(g))return; done.add(g); ul.append(groupRow(g)); if(g.open)g.members.forEach(x=>ul.append(partRow(x,true)));
  });
}
