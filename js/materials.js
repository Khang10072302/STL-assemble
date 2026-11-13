'use strict';
// Chất liệu in 3D (PLA, PETG, Matte, Silk, Metallic, Clear) và bảng màu filament
// ---- Chất liệu in 3D và màu filament (chỉ để minh họa) ----
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
function markMat(){document.querySelectorAll('[data-mat]').forEach(b=>b.classList.toggle('on',!!sel&&sel.userData.mat===b.dataset.mat))}
Object.entries(MATS).forEach(([k,p])=>{const b=document.createElement('button');b.textContent=p.n;b.dataset.mat=k;b.onclick=()=>{if(selSet.size){selSet.forEach(p=>setMat(p,k));markMat();push()}};$('mats').append(b)});
['#f5f5f5','#222222','#8a8f98','#d62828','#f77f00','#fcbf49','#2a9d4f','#2a6fdb','#7b4fd1','#f28ab2','#8b5a2b','#e8c9a0'].forEach(c=>{
  const b=document.createElement('button');b.className='sw';b.style.background=c;b.title=c;
  b.onclick=()=>{if(selSet.size){selSet.forEach(p=>p.material.color.set(c));renderList();push()}};$('swatches').append(b)});
