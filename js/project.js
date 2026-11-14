'use strict';
// Lưu / mở project .stlproj (hình học, vị trí, màu, chất liệu, nhóm, khóa, mối ghép, góc nhìn)
// Định dạng: file zip gồm project.json (thông tin) và geo/<số>.bin (tọa độ đỉnh Float32 của từng phần)
function saveProject(){
  if(!parts.length){hint.textContent='Chưa có phần nào để lưu.';return}
  const idx=new Map(parts.map((m,i)=>[m,i])), files={};
  const P=parts.map((m,i)=>{
    const a=m.geometry.attributes.position.array; files['geo/'+i+'.bin']=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);
    return {name:m.userData.name,file:m.userData.file,pos:(m.userData.base||m.position).toArray(),quat:m.quaternion.toArray(),scale:m.scale.toArray(),color:m.material.color.getHex(),
      mat:m.userData.mat||'pla',visible:m.visible,locked:!!m.userData.locked,stick:m.userData.stick!==false};
  });
  const meta={format:'stlproj',version:1,parts:P,nextX,n,gid,grid:grid.visible,
    groups:groups.map(g=>({name:g.name,locked:g.locked,open:g.open,members:g.members.map(m=>idx.get(m))})),
    joints:joints.map(j=>({a:idx.get(j.a),b:idx.get(j.b),mode:j.mode,locked:j.locked,mp:j.marker.position.toArray(),ms:j.marker.scale.x})),
    view:{ortho:!!camera.isOrthographicCamera,pos:camera.position.toArray(),target:orbit.target.toArray(),zoom:camera.zoom,orthoH}};
  files['project.json']=strToU8(JSON.stringify(meta));
  const url=URL.createObjectURL(new Blob([zipSync(files,{level:6})],{type:'application/zip'}));
  const a=document.createElement('a'); a.href=url; a.download='stl-assembly-'+new Date().toISOString().slice(0,16).replace(/[-:T]/g,'')+'.stlproj'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  hint.textContent='Đã lưu project ('+parts.length+' phần).';
}
function clearAll(){
  tc.detach(); parts.forEach(m=>{scene.remove(m);m.geometry.dispose();m.material.dispose()}); parts.length=0;
  joints.forEach(j=>j.marker.removeFromParent()); joints=[]; groups=[]; selSet.clear(); sel=null; snapReset(); hist=[]; hi=-1;
}
async function openProject(buf){
  let z,J; try{z=unzipSync(new Uint8Array(buf));J=JSON.parse(strFromU8(z['project.json']))}catch(e){throw new Error('không phải file project hợp lệ')}
  if(J.format!=='stlproj')throw new Error('sai định dạng project');
  const ms=J.parts.map((r,i)=>{ // dựng hết trước khi xóa cảnh hiện tại, lỗi thì không mất gì
    const raw=z['geo/'+i+'.bin']; if(!raw)throw new Error('thiếu dữ liệu hình học của '+r.name);
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength)),3));
    g.computeVertexNormals(); g.computeBoundingBox();
    const m=new THREE.Mesh(g,new THREE.MeshPhysicalMaterial({color:r.color}));
    m.userData.name=r.name; m.userData.file=r.file; m.position.fromArray(r.pos); m.quaternion.fromArray(r.quat); m.scale.fromArray(r.scale);
    m.visible=r.visible; m.userData.locked=r.locked; m.userData.stick=r.stick; setMat(m,r.mat); return m;
  });
  if(exploded)setExplode(0);
  if(parts.length&&!confirm('Mở project sẽ thay thế các phần đang có. Tiếp tục?'))return;
  clearAll(); ms.forEach(m=>{scene.add(m);parts.push(m)});
  groups=J.groups.map(r=>{const g={name:r.name,locked:r.locked,open:r.open,members:r.members.map(i=>ms[i])};g.members.forEach(m=>m.userData.group=g);return g});
  J.joints.forEach(r=>{const mk=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),jointMat);mk.renderOrder=9;mk.position.fromArray(r.mp);mk.scale.setScalar(r.ms);ms[r.a].add(mk);joints.push({a:ms[r.a],b:ms[r.b],mode:r.mode,locked:r.locked,marker:mk})});
  nextX=J.nextX; n=J.n; gid=J.gid; grid.visible=J.grid!==false; $('showGrid').checked=grid.visible;
  setProjection(J.view.ortho); camera.position.fromArray(J.view.pos); orbit.target.fromArray(J.view.target);
  if(camera.isOrthographicCamera){orthoH=J.view.orthoH;camera.zoom=J.view.zoom;updOrtho()} camera.updateProjectionMatrix();
  select(null); push(); hint.textContent='Đã mở project ('+ms.length+' phần).';
}
$('saveProj').onclick=saveProject;
$('openProj').onchange=e=>{loadFiles(e.target.files);e.target.value=''};
