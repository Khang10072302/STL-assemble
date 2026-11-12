'use strict';
// Chế độ dời/xoay/co giãn của gizmo và bám lưới
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
function setMode(m){tc.setMode(m);document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('on',b.dataset.mode===m))}
$('snapGrid').onchange=e=>{tc.setTranslationSnap(e.target.checked?5:null);tc.setRotationSnap(e.target.checked?THREE.MathUtils.degToRad(15):null);tc.setScaleSnap(e.target.checked?0.1:null)};
