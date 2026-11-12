'use strict';
// Lõi: cảnh 3D, camera, renderer, ánh sáng, lưới, OrbitControls, TransformControls, biến trạng thái chung, vòng lặp vẽ
THREE.Object3D.DEFAULT_UP.set(0,0,1); // STL/CAD dùng trục Z hướng lên
const $=id=>document.getElementById(id);
const view=$('view'), hint=$('hint');
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xe6e9ee);
const persp=new THREE.PerspectiveCamera(45,1,0.1,1e6), ortho=new THREE.OrthographicCamera(-1,1,1,-1,0.1,1e6); let camera=ortho, orthoH=220;
camera.position.set(300,-300,300); // mặc định: nhìn trực giao theo hướng isometric
const pxScale=p=>camera.isOrthographicCamera?orthoH/camera.zoom*.03:camera.position.distanceTo(p)*.012; // kích thước chấm/đánh dấu theo màn hình
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); renderer.setPixelRatio(devicePixelRatio); view.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x8a8f99,.5));
scene.environment=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),0.04).texture; // để chất liệu bóng/kim loại có phản chiếu
const sun=new THREE.DirectionalLight(0xffffff,1.6); sun.position.set(200,-300,500); scene.add(sun);
const grid=new THREE.GridHelper(600,60,0x8a93a0,0xc3c9d2); grid.rotation.x=Math.PI/2; scene.add(grid);

const orbit=new OrbitControls(camera,renderer.domElement); orbit.enableDamping=true;
const tc=new TransformControls(camera,renderer.domElement); scene.add(tc);
tc.addEventListener('dragging-changed',e=>{orbit.enabled=!e.value;if(e.value)beginMove();else{snapReset();push()}});
tc.addEventListener('objectChange',()=>{propagate();fillFields()});

const parts=[], selSet=new Set(); let joints=[], groups=[], gid=0, sel=null, nextX=0, n=0, lastM=null, exploded=false;
const colors=[0x4aa3ff,0xff7a59,0x6fcf97,0xf2c94c,0xbb86fc,0xe0e0e0];

function resize(){const w=view.clientWidth,h=view.clientHeight;renderer.setSize(w,h);persp.aspect=w/h;persp.updateProjectionMatrix();updOrtho()}
function loop(){requestAnimationFrame(loop);orbit.update();if(exploded||(sel&&isLocked(sel)))tc.visible=false;renderer.render(scene,camera);if(window.vcDraw)window.vcDraw()}
