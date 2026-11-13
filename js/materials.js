'use strict';
// Chất liệu in 3D (PLA, PETG, Matte, Silk, Metallic, Clear) và bảng màu filament (thêm / sửa / xóa màu)
// ---- Chất liệu in 3D (chỉ để minh họa) ----
const MATS={
  pla:{n:'PLA',roughness:.5,metalness:0,clearcoat:0,clearcoatRoughness:.3,opacity:1},
  petg:{n:'PETG',roughness:.22,metalness:0,clearcoat:.5,clearcoatRoughness:.15,opacity:1},
  matte:{n:'Matte',roughness:.95,metalness:0,clearcoat:0,clearcoatRoughness:.3,opacity:1},
  silk:{n:'Silk',roughness:.28,metalness:.7,clearcoat:.35,clearcoatRoughness:.2,opacity:1},
  metal:{n:'Metallic',roughness:.4,metalness:.95,clearcoat:0,clearcoatRoughness:.3,opacity:1},
  clear:{n:'Clear',roughness:.05,metalness:0,clearcoat:1,clearcoatRoughness:.05,opacity:.35}
};
function setMat(m,k){
  k=MATS[k]?k:'pla'; const p=MATS[k];
  Object.assign(m.material,{roughness:p.roughness,metalness:p.metalness,clearcoat:p.clearcoat,clearcoatRoughness:p.clearcoatRoughness,opacity:p.opacity,transparent:p.opacity<1,depthWrite:p.opacity>=1,envMapIntensity:.9});
  m.material.needsUpdate=true; m.userData.mat=k;
}
function markMat(){document.querySelectorAll('[data-mat]').forEach(b=>b.classList.toggle('on',!!sel&&sel.userData.mat===b.dataset.mat)); markSwatches()}
Object.entries(MATS).forEach(([k,p])=>{const b=document.createElement('button');b.textContent=p.n;b.dataset.mat=k;b.onclick=()=>{if(selSet.size){selSet.forEach(p=>setMat(p,k));markMat();push()}};$('mats').append(b)});

// ---- Bảng màu: thêm (+), sửa, xóa; lưu trong trình duyệt (localStorage) ----
const PAL_KEY='stl-assembler.palette';
const PAL_DEFAULT=['#f5f5f5','#222222','#8a8f98','#d62828','#f77f00','#fcbf49','#2a9d4f','#2a6fdb','#7b4fd1','#f28ab2','#8b5a2b','#e8c9a0'];
function loadPalette(){
  try{const a=JSON.parse(localStorage.getItem(PAL_KEY)); if(Array.isArray(a))return a.filter(c=>/^#[0-9a-f]{6}$/i.test(c)).map(c=>c.toLowerCase())}catch(e){}
  return PAL_DEFAULT.slice();
}
let PALETTE=loadPalette(), swEls=[], colorMenu=null;
function savePalette(){try{localStorage.setItem(PAL_KEY,JSON.stringify(PALETTE))}catch(e){}}
const hexOf=p=>'#'+p.material.color.getHexString();
function markSwatches(){ // viền xanh quanh màu mà tất cả phần đang chọn đang dùng
  swEls.forEach((b,i)=>{b.style.boxShadow=selSet.size&&[...selSet].every(p=>hexOf(p)===PALETTE[i])?'0 0 0 2px #4aa3ff':''});
}
function paintSel(c){selSet.forEach(p=>p.material.color.set(c)); renderList(); markSwatches(); push()}
function addColor(hex){PALETTE.push(hex.toLowerCase()); savePalette(); renderSwatches(); if(selSet.size)paintSel(hex)}
function deleteColor(i){PALETTE.splice(i,1); savePalette(); renderSwatches()} // phần nào đã tô màu đó vẫn giữ nguyên màu
function editColor(i,hex,follow){ // follow: các phần đang chọn và đang dùng màu này đổi theo
  const old=PALETTE[i]; PALETTE[i]=hex.toLowerCase();
  if(follow)selSet.forEach(p=>{if(hexOf(p)===old)p.material.color.set(hex)});
  savePalette(); renderSwatches(); if(follow)renderList();
}
function swatchClick(i,anchor){ // đang chọn phần: bấm để tô, bấm lần nữa để mở menu. Chưa chọn phần nào: mở menu ngay
  const c=PALETTE[i];
  if(selSet.size&&![...selSet].every(p=>hexOf(p)===c)){paintSel(c);return}
  openColorMenu(anchor,i);
}
function closeColorMenu(){
  if(!colorMenu)return; colorMenu.remove(); colorMenu=null;
  document.removeEventListener('pointerdown',menuAway,true); document.removeEventListener('keydown',menuKey,true);
}
function menuAway(e){if(colorMenu&&!colorMenu.contains(e.target))closeColorMenu()}
function menuKey(e){if(e.key==='Escape')closeColorMenu()}
function openColorMenu(anchor,idx){ // idx = -1: thêm màu mới
  closeColorMenu();
  const adding=idx<0, follow=!adding&&selSet.size>0, r=anchor.getBoundingClientRect(), m=document.createElement('div');
  m.style.cssText='position:fixed;z-index:30;display:flex;gap:6px;align-items:center;padding:8px;background:#262a31;border:1px solid #3a404a;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.35)';
  m.style.left=Math.max(4,Math.min(r.left,(window.innerWidth||800)-250))+'px'; m.style.top=(r.bottom+6)+'px';
  const inp=document.createElement('input'); inp.type='color'; inp.value=adding?'#9aa3ae':PALETTE[idx]; inp.setAttribute('aria-label','Chọn màu');
  const ok=document.createElement('button'); ok.textContent=adding?'Thêm màu':'Xong';
  inp.oninput=()=>{if(!adding)editColor(idx,inp.value,follow)};
  inp.onchange=()=>{if(!adding&&follow)push()};
  ok.onclick=()=>{if(adding)addColor(inp.value); closeColorMenu()};
  m.append(inp,ok);
  if(!adding){const del=document.createElement('button'); del.textContent='Xóa màu'; del.onclick=()=>{deleteColor(idx);closeColorMenu()}; m.append(del)}
  document.body.append(m); colorMenu=m;
  document.addEventListener('pointerdown',menuAway,true); document.addEventListener('keydown',menuKey,true);
  try{inp.click()}catch(e){} // mở luôn bảng chọn màu của trình duyệt
}
function renderSwatches(){
  const box=$('swatches'); box.innerHTML=''; swEls=[];
  PALETTE.forEach((c,i)=>{
    const b=document.createElement('button'); b.className='sw'; b.style.background=c; b.setAttribute('aria-label','Màu '+c);
    b.title='Bấm để tô màu cho phần đang chọn. Bấm lần nữa (hoặc khi chưa chọn phần nào) để sửa hoặc xóa màu.';
    b.onclick=()=>swatchClick(i,b); box.append(b); swEls.push(b);
  });
  const add=document.createElement('button'); add.className='sw'; add.textContent='+'; add.title='Thêm màu mới'; add.setAttribute('aria-label','Thêm màu mới');
  add.style.cssText='background:transparent;border:1.5px dashed #9aa3ae;color:#e8eaed;font-size:15px;line-height:1;cursor:pointer';
  add.onclick=()=>openColorMenu(add,-1); box.append(add); markSwatches();
}
renderSwatches();
