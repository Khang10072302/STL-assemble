'use strict';
// Chất liệu in 3D (PLA, PETG, Matte, Silk, Metallic, Clear) và bảng màu filament (thêm / sửa / xóa màu)
// ---- Chất liệu in 3D (chỉ để minh họa) ----
const MATS={
  pla:{n:'PLA',roughness:.5,metalness:0,clearcoat:0,clearcoatRoughness:.3,opacity:1},
  petg:{n:'PETG',roughness:.22,metalness:0,clearcoat:.5,clearcoatRoughness:.15,opacity:1},
  matte:{n:'Nhựa mờ (Matte)',roughness:.95,metalness:0,clearcoat:0,clearcoatRoughness:.3,opacity:1},
  silk:{n:'Silk (bóng lụa)',roughness:.28,metalness:.7,clearcoat:.35,clearcoatRoughness:.2,opacity:1},
  metal:{n:'Kim loại (Metallic)',roughness:.4,metalness:.95,clearcoat:0,clearcoatRoughness:.3,opacity:1},
  clear:{n:'Trong suốt (Clear)',roughness:.05,metalness:0,clearcoat:1,clearcoatRoughness:.05,opacity:.35}
};
function setMat(m,k){
  k=MATS[k]?k:'pla'; const p=MATS[k];
  Object.assign(m.material,{roughness:p.roughness,metalness:p.metalness,clearcoat:p.clearcoat,clearcoatRoughness:p.clearcoatRoughness,opacity:p.opacity,transparent:p.opacity<1,depthWrite:p.opacity>=1,envMapIntensity:.9});
  m.material.needsUpdate=true; m.userData.mat=k;
}
function markMat(){$('matSel').value=sel?(sel.userData.mat||'pla'):'pla'; markSwatches()}
Object.entries(MATS).forEach(([k,p])=>{const o=document.createElement('option');o.value=k;o.textContent=p.n;$('matSel').append(o)});
$('matSel').onchange=e=>{if(selSet.size){selSet.forEach(p=>setMat(p,e.target.value));push()}markMat()};

// ---- Bảng màu: thêm (+), sửa, xóa; lưu trong trình duyệt (localStorage) ----
const PAL_KEY='stl-assembler.palette.v2', PAL_OLD_KEY='stl-assembler.palette'; // v2: bảng màu mặc định mới (lấy từ ảnh hộp filament)
// Màu ước lượng từ ảnh chụp các hộp filament (đã hiệu chỉnh theo độ sáng của ảnh). Sửa ở menu màu nếu cần.
const FILAMENTS=[['#cdb764','Matte PLA – Mustard Yellow'],['#6b252e','Matte PLA – Brick Red'],['#233221','Matte PLA – Army Green'],['#0e6dbf','Matte PLA – Powder Blue'],
  ['#6d553f','Matte PLA – Walnut Brown'],['#836c3a','Silk PLA – Gold'],['#a3a1a0','PETG – Clear'],['#1d243e','PLA – Blue'],['#4d4952','PLA – Grey']];
const PAL_DEFAULT=FILAMENTS.map(f=>f[0]), PAL_NAMES=Object.fromEntries(FILAMENTS);
const PAL_OLD_DEFAULT=['#f5f5f5','#222222','#8a8f98','#d62828','#f77f00','#fcbf49','#2a9d4f','#2a6fdb','#7b4fd1','#f28ab2','#8b5a2b','#e8c9a0'];
function loadPalette(){
  const read=k=>{try{const a=JSON.parse(localStorage.getItem(k)); return Array.isArray(a)?a.filter(c=>/^#[0-9a-f]{6}$/i.test(c)).map(c=>c.toLowerCase()):null}catch(e){return null}};
  const v2=read(PAL_KEY); if(v2)return v2;
  const old=read(PAL_OLD_KEY); // bảng màu cũ: giữ lại các màu bạn tự thêm
  return old?PAL_DEFAULT.concat(old.filter(c=>!PAL_OLD_DEFAULT.includes(c)&&!PAL_DEFAULT.includes(c))):PAL_DEFAULT.slice();
}
let PALETTE=loadPalette(), swEls=[], colorMenu=null;
function savePalette(){try{localStorage.setItem(PAL_KEY,JSON.stringify(PALETTE))}catch(e){}}
const hexOf=p=>'#'+p.material.color.getHexString();
function markSwatches(){ // viền xanh quanh màu mà tất cả phần đang chọn đang dùng
  swEls.forEach((b,i)=>b.classList.toggle('on',!!selSet.size&&[...selSet].every(p=>hexOf(p)===PALETTE[i])));
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
  m.style.cssText='position:fixed;z-index:30;display:flex;gap:6px;align-items:center;padding:8px;background:#0d1a2b;border:1px solid #223853;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.35)';
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
    const b=document.createElement('button'); b.className='sw'; b.style.background=c; b.innerHTML=icon('check',18); b.setAttribute('aria-label','Màu '+c);
    b.title=(PAL_NAMES[c]?PAL_NAMES[c]+'. ':'')+'Bấm để tô màu cho chi tiết đang chọn. Bấm lần nữa (hoặc khi chưa chọn gì) để sửa hoặc xóa màu.';
    b.onclick=()=>swatchClick(i,b); box.append(b); swEls.push(b);
  });
  const add=document.createElement('button'); add.className='sw add'; add.innerHTML=icon('plus',18); add.title='Thêm màu mới'; add.setAttribute('aria-label','Thêm màu mới');
  add.onclick=()=>openColorMenu(add,-1); box.append(add); markSwatches();
}
renderSwatches();
