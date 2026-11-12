'use strict';
// Tạo phần từ lưới STL: tính điểm thấp nhất, đưa tâm về gốc, xếp vị trí các phần mới
function minZ(m){ // điểm thấp nhất thật sự của phần (tính trên từng đỉnh)
  m.updateMatrixWorld(true); const e=m.matrixWorld.elements,p=m.geometry.attributes.position.array; let z=Infinity;
  for(let i=0;i<p.length;i+=3){const v=e[2]*p[i]+e[6]*p[i+1]+e[10]*p[i+2]+e[14];if(v<z)z=v}
  return z;
}
function dropToPlane(m){m.position.z-=minZ(m)}
function makePart(name,geo,col){ // hình học về dạng không chỉ mục, đưa tâm về gốc; nhớ tâm cũ để giữ bố cục trong file
  if(!geo.attributes.position||!geo.attributes.position.count)throw new Error('empty');
  if(geo.index)geo=geo.toNonIndexed();
  Object.keys(geo.attributes).forEach(k=>{if(k!=='position'&&k!=='normal')geo.deleteAttribute(k)});
  geo.computeVertexNormals(); geo.computeBoundingBox();
  const c=geo.boundingBox.getCenter(new THREE.Vector3()), size=geo.boundingBox.getSize(new THREE.Vector3());
  geo.translate(-c.x,-c.y,-c.z);
  const mesh=new THREE.Mesh(geo,new THREE.MeshPhysicalMaterial({color:col!==undefined?col:colors[n++%colors.length]}));
  mesh.userData.name=name; mesh.userData.c=c; mesh.userData.size=size; return mesh;
}
function place(ms){ // xếp cả file cạnh các phần có sẵn, giữ nguyên vị trí tương đối giữa các phần trong cùng file
  const U=new THREE.Box3(); ms.forEach(m=>{const h=m.userData.size.clone().multiplyScalar(.5);U.expandByPoint(m.userData.c.clone().sub(h));U.expandByPoint(m.userData.c.clone().add(h))});
  const uc=U.getCenter(new THREE.Vector3()), us=U.getSize(new THREE.Vector3());
  ms.forEach(m=>{m.position.set(nextX+us.x/2,0,us.z/2).add(m.userData.c).sub(uc);m.updateMatrixWorld(true)});
  nextX+=us.x+20;
  const zs=ms.map(minZ), g=Math.min(...zs), tol=Math.max(us.z*.01,1e-3);
  ms.forEach((m,i)=>{m.position.z-=g; m.userData.stick=zs[i]-g<tol; scene.add(m);setMat(m,'pla');parts.push(m)}); // phần đang lơ lửng trong file thì không dính
}
function fromSTL(name,buf){return [makePart(name.replace(/\.stl$/i,''),new STLLoader().parse(buf))]}
