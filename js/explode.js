'use strict';
// Exploded view nhiều lớp: mỗi lớp tách theo một kiểu (tỏa từ tâm hoặc dọc trục X/Y/Z), các lớp cộng dồn nhau
// Vị trí ghép thật được giữ trong userData.base trong lúc đang tách
const EX_SCALE=3; // hệ số khoảng cách tách (1 = bản đầu tiên)
const EX_KINDS={radial:'Tỏa ra từ tâm',x:'Dọc trục X',y:'Dọc trục Y',z:'Dọc trục Z'};
let exLayers=[{kind:'radial',amt:0}]; // amt: mức tách 0..1 của lớp
function layerOffsets(kind){ // độ dời của từng chi tiết khi lớp này ở mức 100% (tính tại vị trí gốc)
  const out=new Map(parts.map(m=>[m,new THREE.Vector3()])), vis=parts.filter(m=>m.visible); if(!vis.length)return out;
  const box=new THREE.Box3(); vis.forEach(m=>box.expandByObject(m));
  const C=box.getCenter(new THREE.Vector3()), S=Math.max(box.getSize(new THREE.Vector3()).length(),1);
  const ctr=new Map(vis.map(m=>[m,new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3())]));
  if(kind==='radial'){
    vis.forEach((m,i)=>{const v=ctr.get(m).clone().sub(C); if(v.length()<S*1e-3)v.set(0,0,(i-(vis.length-1)/2)||1); out.get(m).copy(v.normalize().multiplyScalar(S*.4*EX_SCALE))});
  }else{
    const ax={x:0,y:1,z:2}[kind], gap=S*.6*EX_SCALE/Math.max(vis.length-1,1); // xếp theo thứ tự dọc trục, các phần trùng tâm vẫn tách ra được
    [...vis].sort((a,b)=>ctr.get(a).getComponent(ax)-ctr.get(b).getComponent(ax)).forEach((m,i)=>out.get(m).setComponent(ax,(i-(vis.length-1)/2)*gap));
  }
  return out;
}
function applyEx(){ // vị trí hiển thị = vị trí gốc + tổng độ dời của các lớp
  parts.forEach(m=>{
    if(!m.userData.base)return; m.position.copy(m.userData.base);
    exLayers.forEach(l=>{const o=l.off&&l.off.get(m); if(o)m.position.addScaledVector(o,l.amt)});
  });
}
function recomputeLayer(l){parts.forEach(m=>{if(m.userData.base)m.position.copy(m.userData.base);m.updateMatrixWorld(true)}); l.off=layerOffsets(l.kind)}
function updateExplode(){
  const any=exLayers.some(l=>l.amt>0), was=exploded;
  if(any&&!was){parts.forEach(m=>m.userData.base=m.position.clone()); exLayers.forEach(recomputeLayer)}
  if(!any&&was)parts.forEach(m=>{if(m.userData.base){m.position.copy(m.userData.base);delete m.userData.base}});
  exploded=any; if(exploded)applyEx();
  syncGizmo(); fillFields(); updUndo();
}
function setExplode(f){ // 0 = gom lại hết (các file khác gọi); f>0 = đặt mức cho lớp đầu tiên
  if(f<=0)exLayers.forEach(l=>l.amt=0); else exLayers[0].amt=Math.min(1,f);
  renderExLayers(); updateExplode();
}
function renderExLayers(){
  const box=$('exLayers'); box.innerHTML='';
  exLayers.forEach((l,i)=>{
    const card=document.createElement('div'); card.className='exl';
    const top=document.createElement('div'); top.className='between';
    const kindSel=document.createElement('select'); kindSel.setAttribute('aria-label','Kiểu tách của lớp '+(i+1));
    Object.entries(EX_KINDS).forEach(([k,t])=>{const o=document.createElement('option');o.value=k;o.textContent=t;kindSel.append(o)}); kindSel.value=l.kind;
    kindSel.onchange=()=>{l.kind=kindSel.value; if(exploded){recomputeLayer(l);applyEx()}};
    const del=document.createElement('button'); del.className='ic'; del.innerHTML=icon('x',16); del.title='Xóa lớp này'; del.setAttribute('aria-label','Xóa lớp '+(i+1)); del.disabled=exLayers.length<2;
    del.onclick=()=>{exLayers.splice(i,1);renderExLayers();updateExplode()};
    top.append(kindSel,del);
    const row=document.createElement('div'); row.className='between';
    const lab=document.createElement('span'); lab.textContent='Mức tách'; const pct=document.createElement('span'); pct.className='pct'; pct.textContent=Math.round(l.amt*100)+'%'; row.append(lab,pct);
    const rg=document.createElement('input'); rg.type='range'; rg.min=0; rg.max=1; rg.step=.01; rg.value=l.amt; rg.setAttribute('aria-label','Mức tách của lớp '+(i+1));
    rg.oninput=()=>{l.amt=+rg.value; pct.textContent=Math.round(l.amt*100)+'%'; updateExplode()};
    card.append(top,row,rg); box.append(card);
  });
  $('exAdd').disabled=exLayers.length>=6;
}
$('exAdd').onclick=()=>{ // lớp mới lấy hướng chưa dùng: X, rồi Y, rồi Z
  const used=new Set(exLayers.map(l=>l.kind)), l={kind:['x','y','z','radial'].find(k=>!used.has(k))||'x',amt:0};
  exLayers.push(l); if(exploded){recomputeLayer(l);applyEx()} renderExLayers();
};
renderExLayers();
