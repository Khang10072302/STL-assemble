'use strict';
// Khối điều hướng kiểu FreeCAD (6 mặt, 12 cạnh, 8 góc), mũi tên xoay, hệ trục X/Y/Z
// ---- Khối điều hướng kiểu FreeCAD: bấm mặt / cạnh / góc để xoay camera tới đó ----
const VC=120, ZONE=.22; // ZONE: bề rộng vùng cạnh/góc trên mỗi mặt (tỉ lệ)
const vr=new THREE.WebGLRenderer({alpha:true,antialias:true}); vr.setPixelRatio(devicePixelRatio); vr.setSize(VC,VC); vr.autoClear=false; $('vc').append(vr.domElement);
const vs=new THREE.Scene(), tri=new THREE.Scene(), vcam=new THREE.PerspectiveCamera(32,1,.1,20);
const FACES=[['TOP',[0,0,1],[0,1,0]],['BOTTOM',[0,0,-1],[0,1,0]],['FRONT',[0,-1,0],[0,0,1]],['BACK',[0,1,0],[0,0,1]],['RIGHT',[1,0,0],[0,0,1]],['LEFT',[-1,0,0],[0,0,1]]].map(([t,n,u])=>{
  const N=new THREE.Vector3(...n), U=new THREE.Vector3(...u), cv=document.createElement('canvas'); cv.width=cv.height=256;
  const tex=new THREE.CanvasTexture(cv), mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:tex}));
  const f={t,n:N,u:U,r:U.clone().cross(N),cv,tex,mesh};
  mesh.matrixAutoUpdate=false; mesh.matrix.makeBasis(f.r,U,N).setPosition(N.clone().multiplyScalar(.5)); vs.add(mesh); return f;
});
vs.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1,1,1)),new THREE.LineBasicMaterial({color:0x0b1626})));
function drawFace(f,D){
  const g=f.cv.getContext('2d'), W=256, z=W*ZONE;
  g.fillStyle='#12233a'; g.fillRect(0,0,W,W); g.fillStyle='#1c3552'; g.fillRect(z,z,W-2*z,W-2*z);
  if(D&&D.dot(f.n)>.5){ // tô sáng vùng đang trỏ vào (mặt, cạnh hoặc góc)
    const ra=Math.round(D.dot(f.r)), rb=Math.round(D.dot(f.u));
    g.fillStyle='#2dd4bf'; g.fillRect(ra<0?0:ra>0?W-z:z, rb>0?0:rb<0?W-z:z, ra===0?W-2*z:z, rb===0?W-2*z:z);
  }
  g.strokeStyle='#0a1626'; g.lineWidth=3; g.strokeRect(z,z,W-2*z,W-2*z); g.strokeRect(1.5,1.5,W-3,W-3);
  g.fillStyle='#d7e6f0'; g.font='bold 34px system-ui,sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(f.t,W/2,W/2+2);
  f.tex.needsUpdate=true;
}
FACES.forEach(f=>drawFace(f,null));

// Hệ trục X (đỏ), Y (xanh lá), Z (xanh dương) ở góc dưới bên trái
tri.add(new THREE.AxesHelper(.8));
[['X','#e5484d',[.98,0,0]],['Y','#30a46c',[0,.98,0]],['Z','#3e63dd',[0,0,.98]]].forEach(([t,c,p])=>{
  const k=document.createElement('canvas'); k.width=k.height=64; const g=k.getContext('2d'); g.fillStyle=c; g.font='bold 44px system-ui,sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(t,32,34);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(k),depthTest:false})); sp.scale.setScalar(.34); sp.position.set(...p); tri.add(sp);
});
window.vcDraw=()=>{
  vcam.position.copy(camera.position).sub(orbit.target).setLength(3.4); vcam.lookAt(0,0,0);
  vr.clear(); vr.setViewport(0,0,VC,VC); vr.render(vs,vcam);
  vr.clearDepth(); vr.setViewport(0,0,46,46); vr.render(tri,vcam); vr.setViewport(0,0,VC,VC);
};

// Chọn vùng: mặt (1 trục), cạnh (2 trục) hoặc góc (3 trục) tùy chỗ bấm trên mặt
const vray=new THREE.Raycaster(), vm=new THREE.Vector2();
function pickCube(e){
  const r=vr.domElement.getBoundingClientRect(); vm.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); vray.setFromCamera(vm,vcam);
  const h=vray.intersectObjects(FACES.map(f=>f.mesh))[0]; if(!h)return null;
  const f=FACES.find(x=>x.mesh===h.object), a=h.uv.x-.5, b=h.uv.y-.5, t=.5-ZONE;
  const ra=a<-t?-1:a>t?1:0, rb=b<-t?-1:b>t?1:0;
  return f.n.clone().addScaledVector(f.r,ra).addScaledVector(f.u,rb).round();
}
let hk='';
vr.domElement.addEventListener('pointermove',e=>{
  const D=pickCube(e), k=D?D.toArray().join():''; if(k===hk)return; hk=k;
  FACES.forEach(f=>drawFace(f,D)); vr.domElement.style.cursor=D?'pointer':'';
});
vr.domElement.addEventListener('pointerleave',()=>{hk='';FACES.forEach(f=>drawFace(f,null))});
vr.domElement.addEventListener('click',e=>{const D=pickCube(e);if(D)animateTo(D)});

// Xoay camera mượt tới hướng D (giữ nguyên khoảng cách và điểm nhìn)
let anim=0;
function animateTo(D){
  D=D.clone().normalize(); if(Math.abs(D.x)<1e-6&&Math.abs(D.y)<1e-6){D.y=-.001*Math.sign(D.z);D.normalize()} // nhìn thẳng từ trên/dưới thì lệch rất nhẹ để tránh suy biến
  const o0=camera.position.clone().sub(orbit.target), q=new THREE.Quaternion().setFromUnitVectors(o0.clone().normalize(),D), t0=performance.now(), id=++anim;
  (function step(now){
    if(id!==anim)return; let k=Math.min(1,(now-t0)/280); k=k*k*(3-2*k);
    camera.position.copy(orbit.target).add(o0.clone().applyQuaternion(new THREE.Quaternion().slerp(q,k)));
    if(k<1)requestAnimationFrame(step);
  })(t0);
}
function stepView(dAz,dPhi){ // 15° mỗi lần bấm mũi tên
  const o=camera.position.clone().sub(orbit.target), r=o.length(), az=Math.atan2(o.y,o.x)+dAz, ph=Math.min(Math.PI-.01,Math.max(.01,Math.acos(o.z/r)+dPhi));
  camera.position.set(r*Math.sin(ph)*Math.cos(az),r*Math.sin(ph)*Math.sin(az),r*Math.cos(ph)).add(orbit.target);
}
const ST=Math.PI/12, ARR={up:[0,-ST],down:[0,ST],left:[ST,0],right:[-ST,0]};
document.querySelectorAll('[data-arrow]').forEach(b=>b.onclick=()=>stepView(...ARR[b.dataset.arrow]));
$('vIso').onclick=()=>animateTo(new THREE.Vector3(1,-1,1));
$('vFit').onclick=frame;
