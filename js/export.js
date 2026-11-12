'use strict';
// Xuất ảnh PNG (độ phân giải, nền trong suốt, ẩn lưới)
// ---- Xuất ảnh PNG ----
function exportPNG(){
  const k=+$('expScale').value, w=view.clientWidth, h=view.clientHeight;
  const hide=[tc,marker,edgeLine,alignGroup,...joints.map(j=>j.marker)], vs=hide.map(o=>o.visible), gv=grid.visible, bg=scene.background;
  hide.forEach(o=>o.visible=false); if($('expGrid').checked)grid.visible=false; if($('expAlpha').checked)scene.background=null;
  renderer.setSize(w*k,h*k,false); renderer.render(scene,camera);
  renderer.domElement.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='stl-assembly.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)});
  hide.forEach((o,i)=>o.visible=vs[i]); grid.visible=gv; scene.background=bg; resize();
}
$('exp').onclick=exportPNG;
