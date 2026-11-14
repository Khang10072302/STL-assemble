'use strict';
// Dính mặt phẳng: đáy luôn chạm lưới, bật/tắt cho chi tiết đang chọn
// ---- Dính mặt phẳng ----
$('stick').onchange=e=>{
  if(!sel)return; const v=e.target.checked;
  if(selSet.size>1)selSet.forEach(p=>{p.userData.stick=v;if(v&&!isLocked(p))dropToPlane(p)}); // nhiều phần: bật/tắt cho tất cả
  else{sel.userData.stick=v;if(v){beginMove();propagate()}}
  fillFields(); push();
};
