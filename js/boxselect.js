'use strict';
// Chọn vùng bằng Shift + kéo chuột (trái sang phải: nằm trọn, phải sang trái: chạm)
// ---- Chọn vùng: Shift + kéo chuột ----
const mq=$('marquee'); let mqs=null;
view.addEventListener('pointerdown',e=>{
  if(e.button!==0||!e.shiftKey||e.target!==renderer.domElement||tc.axis!==null)return;
  e.stopPropagation(); // không cho OrbitControls chuyển thành kéo (pan)
  const r=view.getBoundingClientRect(); mqs={x:e.clientX-r.left,y:e.clientY-r.top,cx:e.clientX,cy:e.clientY,moved:false};
},true);
window.addEventListener('pointermove',e=>{
  if(!mqs)return; if(Math.hypot(e.clientX-mqs.cx,e.clientY-mqs.cy)>4)mqs.moved=true; if(!mqs.moved)return;
  const r=view.getBoundingClientRect(); mqs.x2=e.clientX-r.left; mqs.y2=e.clientY-r.top;
  Object.assign(mq.style,{display:'block',left:Math.min(mqs.x,mqs.x2)+'px',top:Math.min(mqs.y,mqs.y2)+'px',width:Math.abs(mqs.x2-mqs.x)+'px',height:Math.abs(mqs.y2-mqs.y)+'px'});
});
window.addEventListener('pointerup',e=>{
  if(!mqs)return; const m=mqs; mqs=null; mq.style.display='none';
  if(m.moved)boxSelect(m); else shiftClick(e);
});
function shiftClick(e){
  if(snapMode&&!exploded)return;
  const r=renderer.domElement.getBoundingClientRect(); mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); ray.setFromCamera(mouse,camera);
  const h=ray.intersectObjects(parts.filter(p=>p.visible))[0]; if(h)select(h.object,true,e.altKey);
}
function boxSelect(m){ // kéo trái sang phải: chọn phần nằm trọn trong vùng; kéo phải sang trái: chọn cả phần chạm vùng
  const w=view.clientWidth, h=view.clientHeight, x0=Math.min(m.x,m.x2), x1=Math.max(m.x,m.x2), y0=Math.min(m.y,m.y2), y1=Math.max(m.y,m.y2), inside=m.x2>=m.x, v=new THREE.Vector3(), hits=[];
  parts.forEach(p=>{
    if(!p.visible)return; const b=worldBox(p); let a=1e9,c=1e9,A=-1e9,C=-1e9,ok=false;
    for(let i=0;i<8;i++){
      v.set(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z).project(camera); if(v.z>1)continue; ok=true;
      const sx=(v.x+1)/2*w, sy=(1-v.y)/2*h; a=Math.min(a,sx);A=Math.max(A,sx);c=Math.min(c,sy);C=Math.max(C,sy);
    }
    if(!ok)return;
    if(inside?(a>=x0&&A<=x1&&c>=y0&&C<=y1):(A>=x0&&a<=x1&&C>=y0&&c<=y1))hits.push(p);
  });
  if(hits.length)setSelection(hits,true);
}
