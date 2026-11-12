'use strict';
// Khung nhìn: căn khung (frame), chế độ trực giao/phối cảnh, ẩn/hiện lưới nền, tốc độ zoom
function frame(){
  if(!parts.length)return; const box=new THREE.Box3(); parts.forEach(m=>box.expandByObject(m));
  const c=box.getCenter(new THREE.Vector3()), r=Math.max(box.getSize(new THREE.Vector3()).length(),50);
  orbit.target.copy(c); camera.position.copy(c).add(new THREE.Vector3(1,-1,1).normalize().multiplyScalar(r*1.3)); camera.near=r/1000; camera.far=r*100; if(camera.isOrthographicCamera){orthoH=r*.62;camera.zoom=1;updOrtho()} camera.updateProjectionMatrix();
}
$('frame').onclick=frame;

// ---- Trực giao (isometric) hoặc phối cảnh ----
function updOrtho(){const a=view.clientWidth/Math.max(1,view.clientHeight);ortho.left=-orthoH*a;ortho.right=orthoH*a;ortho.top=orthoH;ortho.bottom=-orthoH;ortho.updateProjectionMatrix()}
function setProjection(toOrtho){
  const old=camera, nw=toOrtho?ortho:persp; if(old===nw)return;
  const dir=old.position.clone().sub(orbit.target), d=dir.length(), k=Math.tan(THREE.MathUtils.degToRad(persp.fov/2));
  if(toOrtho){orthoH=d*k;ortho.zoom=1;ortho.position.copy(old.position)}
  else persp.position.copy(orbit.target).addScaledVector(dir.normalize(),orthoH/ortho.zoom/k); // giữ nguyên độ lớn hiển thị khi đổi
  nw.near=old.near; nw.far=old.far; camera=nw; orbit.object=nw; tc.camera=nw; updOrtho(); nw.updateProjectionMatrix();
  $('proj').classList.toggle('on',toOrtho);
}
$('proj').onclick=()=>setProjection(!camera.isOrthographicCamera);


// ---- Ẩn/hiện lưới nền và tốc độ zoom ----
orbit.zoomSpeed=4; orbit.zoomToCursor=true; orbit.dampingFactor=.12; // zoom nhanh hơn và hướng về vị trí con trỏ
$('showGrid').onchange=e=>{grid.visible=e.target.checked};
$('zoomSpd').oninput=e=>{orbit.zoomSpeed=+e.target.value};
