'use strict';
// Bảng nhập số X/Y/Z, góc xoay, tỉ lệ
function fillFields(){
  const d=!sel||exploded||selLocked(); $('stick').disabled=d; ['px','py','pz','rx','ry','rz','sc'].forEach(i=>$(i).disabled=d); if(!sel)return;
  markMat(); $('stick').checked=sel.userData.stick!==false; const r=v=>+v.toFixed(3), D=180/Math.PI;
  $('px').value=r(sel.position.x);$('py').value=r(sel.position.y);$('pz').value=r(sel.position.z);
  $('rx').value=r(sel.rotation.x*D);$('ry').value=r(sel.rotation.y*D);$('rz').value=r(sel.rotation.z*D);$('sc').value=r(sel.scale.x);
}
const edit=f=>e=>{if(sel&&!selLocked()&&e.target.value!==''){beginMove();f(+e.target.value);propagate()}};
['px','py','pz'].forEach(i=>{$(i).oninput=edit(v=>sel.position[i[1]]=v)});
['rx','ry','rz'].forEach(i=>{$(i).oninput=edit(v=>sel.rotation[i[1]]=v*Math.PI/180)});
$('sc').oninput=edit(v=>{if(v>0)sel.scale.setScalar(v)});
['px','py','pz','rx','ry','rz','sc'].forEach(i=>$(i).onchange=push);
