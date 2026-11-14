'use strict';
// Danh sách chi tiết (có nhóm, ổ khóa, màu, ẩn/hiện); thao tác trên một chi tiết đang chọn áp dụng cho cả vùng chọn
function remove(m){deleteParts(targets(m))} // nút xóa trên dòng; nếu chi tiết đó đang được chọn cùng nhiều chi tiết thì xóa cả vùng chọn
function colorFor(m,hex){targets(m).forEach(p=>p.material.color.set(hex))}
function visibleFor(m,v){targets(m).forEach(p=>p.visible=v)}
function iconBtn(cls,name,title,fn){
  const b=document.createElement('button'); b.className=cls; b.innerHTML=icon(name,cls==='ic x'?16:18); b.title=title; b.setAttribute('aria-label',title); b.onclick=fn; return b;
}
function rowText(html){ // vùng tên bấm được; dùng div role=button để bố cục hai dòng (tên + mã) ổn định
  const t=document.createElement('div'); t.className='rt'; t.setAttribute('role','button'); t.tabIndex=0; t.innerHTML=html;
  t.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t.click()}}; return t;
}
function partRow(m,indent){
  const li=document.createElement('li'); li.className='row'+(selSet.has(m)?' sel':'')+(indent?' in':'')+(m.visible?'':' off');
  const c=document.createElement('input'); c.type='color'; c.className='cswatch'; c.value='#'+m.material.color.getHexString(); c.title='Đổi màu';
  c.oninput=()=>colorFor(m,c.value); c.onchange=()=>{renderList();push()};
  const t=rowText('<b></b><small></small>');
  t.firstChild.textContent=m.userData.name; t.lastChild.textContent=partTag(m);
  t.onclick=e=>select(m,e.ctrlKey||e.metaKey||e.shiftKey,true);
  const v=iconBtn('ic eye',m.visible?'eye':'eyeOff','Hiện/ẩn',()=>{visibleFor(m,!m.visible);syncGizmo();renderList();push()});
  const lk=lockBtn(()=>isLocked(m),()=>toggleLockFor(m),!!(m.userData.group&&m.userData.group.locked));
  const x=iconBtn('ic x','trash','Xóa',()=>remove(m));
  li.append(c,t,v,lk,x); return li;
}
function renameGroup(g){const n=prompt('Tên nhóm',g.name); if(n&&n.trim()){g.name=n.trim();renderList();push()}}
function ungroupOne(g){g.members.forEach(m=>m.userData.group=null);groups=groups.filter(k=>k!==g);finishSel();push()}
function groupRow(g){
  const li=document.createElement('li'); li.className='row grp'+(g.members.every(m=>selSet.has(m))?' sel':'');
  const tg=iconBtn('ic tg',g.open?'chevD':'chevR',g.open?'Thu gọn':'Mở rộng',()=>{g.open=!g.open;renderList()});
  const gl=document.createElement('span'); gl.className='glyph'; gl.innerHTML=icon('layers',18);
  const t=rowText('<b></b>'); t.firstChild.textContent=g.name+' ('+g.members.length+')';
  t.title='Bấm để chọn cả nhóm, bấm đúp để đổi tên'; t.onclick=()=>setSelection(g.members.slice(),false); t.ondblclick=()=>renameGroup(g);
  const anyVis=g.members.some(m=>m.visible);
  const v=iconBtn('ic eye',anyVis?'eye':'eyeOff','Hiện/ẩn cả nhóm',()=>{setGroupVisible(g,!anyVis);syncGizmo();renderList();push()});
  const lk=lockBtn(()=>g.locked,()=>toggleGroupLock(g),false);
  const more=iconBtn('ic','more','Tùy chọn nhóm',()=>popMenu(more,[{label:'Đổi tên',fn:()=>renameGroup(g)},{label:g.open?'Thu gọn':'Mở rộng',fn:()=>{g.open=!g.open;renderList()}},{label:'Tách nhóm',fn:()=>ungroupOne(g),danger:true}]));
  li.append(tg,gl,t,v,lk,more); return li;
}
function renderList(){
  const ul=$('list'); ul.innerHTML=''; $('empty').hidden=parts.length>0; renderJoints();
  const done=new Set();
  parts.forEach(m=>{
    const g=m.userData.group; if(!g){ul.append(partRow(m,false));return}
    if(done.has(g))return; done.add(g); ul.append(groupRow(g)); if(g.open)g.members.forEach(x=>ul.append(partRow(x,true)));
  });
  uiSync();
}
