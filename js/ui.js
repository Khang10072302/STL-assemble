'use strict';
// Giao diện: biểu tượng SVG, tab bảng Thuộc tính, menu nổi, nhãn khung nhìn, thẻ chi tiết đang chọn
const ICONS={
  cube:'<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3.3 7.5L12 12.5l8.7-5M12 22V12.5"/>',
  move:'<path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>',
  rotate:'<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  scale:'<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
  undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  redo:'<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
  save:'<path d="M5 3h11l4 4v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M7 3v5h8V3M7 21v-7h10v7"/>',
  download:'<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  layers:'<path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z"/><path d="M3 12l9 4.5 9-4.5M3 16.5L12 21l9-4.5"/>',
  chevD:'<path d="M6 9l6 6 6-6"/>', chevR:'<path d="M9 6l6 6-6 6"/>',
  eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff:'<path d="M3 3l18 18M10.6 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7c1.6 0 3-.4 4.3-1"/>',
  more:'<circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/>',
  maximize:'<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'
};
function icon(n,s){return '<svg viewBox="0 0 24 24" width="'+(s||18)+'" height="'+(s||18)+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICONS[n]+'</svg>'}
document.querySelectorAll('[data-ic]').forEach(el=>{el.innerHTML=icon(el.dataset.ic,+el.dataset.size||18)});

// ---- Tab của bảng Thuộc tính ----
function showTab(t){
  document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));
  document.querySelectorAll('[data-pane]').forEach(p=>p.hidden=p.dataset.pane!==t);
}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));

// ---- Menu nổi: menu có sẵn trong HTML (bindPop) và menu tạo lúc bấm (popMenu) ----
let openPop=null;
function hidePop(){if(!openPop)return; openPop.el.hidden=true; if(openPop.el.dataset.dyn)openPop.el.remove(); openPop=null}
function showPop(el,btn){hidePop(); el.hidden=false; openPop={el,btn}}
function bindPop(btn,pop){btn.onclick=()=>openPop&&openPop.el===pop?hidePop():showPop(pop,btn)}
function popMenu(anchor,items){
  const m=document.createElement('div'); m.className='menu'; m.dataset.dyn='1';
  items.forEach(it=>{const b=document.createElement('button'); b.textContent=it.label; if(it.danger)b.className='danger'; b.onclick=()=>{hidePop();it.fn()}; m.append(b)});
  const r=anchor.getBoundingClientRect(); m.style.top=(r.bottom+6)+'px'; m.style.left=Math.max(8,Math.min(r.right-190,(window.innerWidth||800)-198))+'px';
  document.body.append(m); showPop(m,anchor);
}
document.addEventListener('pointerdown',e=>{if(openPop&&!openPop.el.contains(e.target)&&!(openPop.btn&&openPop.btn.contains(e.target)))hidePop()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')hidePop()});
bindPop($('expBtn'),$('expPop')); bindPop($('projBtn'),$('projMenu'));
$('partsMore').onclick=()=>openPop&&openPop.btn===$('partsMore')?hidePop():popMenu($('partsMore'),[{label:'Chọn tất cả',fn:selectAllParts},{label:'Bỏ chọn',fn:()=>select(null)}]);

// ---- Đồng bộ thông tin hiển thị: số chi tiết, nhãn khung nhìn, thẻ chi tiết đang chọn ----
function partTag(m){return 'PART / '+String(parts.indexOf(m)+1).padStart(2,'0')}
function uiSync(){
  const g=sel&&sel.userData.group, whole=!!g&&g.members.every(m=>selSet.has(m)), many=selSet.size>1;
  $('partCount').textContent=parts.length;
  $('vlabel').textContent=(editGroup?editGroup.name+' › ':'')+(whole?g.name:many?selSet.size+' chi tiết đã chọn':sel?sel.userData.name:'Chưa chọn chi tiết')+' / '+parts.length+' chi tiết';
  $('selSw').style.background=sel?'#'+sel.material.color.getHexString():'#10243b';
  $('selName').textContent=sel?(whole?g.name:many?selSet.size+' chi tiết':sel.userData.name):'Chưa chọn chi tiết';
  $('selSub').textContent=sel?(many?'Áp dụng cho tất cả chi tiết đang chọn':partTag(sel)+(sel.userData.file?' · '+sel.userData.file:'')):'Bấm vào một chi tiết để chỉnh';
  $('matSel').disabled=!sel;
}
