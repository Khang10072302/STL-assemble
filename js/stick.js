'use strict';
// Dính mặt phẳng: đáy luôn chạm lưới, bật/tắt từng phần hoặc tất cả
// ---- Dính mặt phẳng ----
$('stick').onchange=e=>{if(!sel)return;sel.userData.stick=e.target.checked;if(e.target.checked){beginMove();propagate();fillFields()}push()};
function setStickAll(v){if(exploded)return;parts.forEach(m=>{m.userData.stick=v;if(v&&!isLocked(m))dropToPlane(m)});fillFields();push()}
$('stickAll').onclick=()=>setStickAll(true); $('stickNone').onclick=()=>setStickAll(false);
