'use strict';
// Đọc file 3MF (zip + XML, hỗ trợ file nhiều lớp của Bambu/Prusa)
// ---- Đọc 3MF: tự phân tích file zip + XML, hỗ trợ file nhiều lớp (components, đường dẫn p:path) như Bambu/Prusa ----
function parse3MF(buf){
  const files=unzipSync(new Uint8Array(buf)), models=new Map(), norm=p=>p.replace(/^\/+/,'');
  const attr=(el,n)=>{for(const a of el.attributes)if((a.localName||a.name).split(':').pop()===n)return a.value;return null};
  const xml=p=>{const f=files[norm(p)];if(!f)throw new Error('thiếu '+p+' trong file');return new DOMParser().parseFromString(strFromU8(f),'application/xml')};
  const matOf=t=>{const m=new THREE.Matrix4();if(t){const a=t.trim().split(/\s+/).map(Number);if(a.length===12)m.set(a[0],a[3],a[6],a[9],a[1],a[4],a[7],a[10],a[2],a[5],a[8],a[11],0,0,0,1)}return m};
  function model(p){
    p=norm(p); if(models.has(p))return models.get(p);
    const doc=xml(p), M={doc,objs:new Map(),mats:new Map()};
    doc.querySelectorAll('basematerials').forEach(b=>M.mats.set(attr(b,'id'),[...b.querySelectorAll('base')].map(x=>attr(x,'displaycolor'))));
    doc.querySelectorAll('object').forEach(o=>M.objs.set(attr(o,'id'),o));
    models.set(p,M); return M;
  }
  function collect(p,id,mx,out,depth){
    if(depth>16)return; const o=model(p).objs.get(id); if(!o)return;
    const mesh=o.querySelector('mesh');
    if(mesh){
      const vs=mesh.getElementsByTagName('vertex'), ts=mesh.getElementsByTagName('triangle'), tv=new Float32Array(vs.length*3), v=new THREE.Vector3();
      for(let i=0;i<vs.length;i++){v.set(+vs[i].getAttribute('x'),+vs[i].getAttribute('y'),+vs[i].getAttribute('z')).applyMatrix4(mx);tv[i*3]=v.x;tv[i*3+1]=v.y;tv[i*3+2]=v.z}
      const pos=new Float32Array(ts.length*9);
      for(let i=0;i<ts.length;i++)for(let k=0;k<3;k++){const j=+ts[i].getAttribute('v'+(k+1))*3;pos[i*9+k*3]=tv[j];pos[i*9+k*3+1]=tv[j+1];pos[i*9+k*3+2]=tv[j+2]}
      out.push(pos);
    }
    o.querySelectorAll('component').forEach(c=>collect(attr(c,'path')||p,attr(c,'objectid'),mx.clone().multiply(matOf(attr(c,'transform'))),out,depth+1));
  }
  let root='3D/3dmodel.model'; const rels=files['_rels/.rels'];
  if(rels){for(const r of strFromU8(rels).match(/<Relationship\b[^>]*>/g)||[]){if(/3dmodel/i.test(r)){const t=r.match(/Target="([^"]+)"/);if(t){root=t[1];break}}}}
  const R=model(root), unit={micron:.001,millimeter:1,centimeter:10,meter:1000,inch:25.4,foot:304.8}[attr(R.doc.documentElement,'unit')]||1, S=new THREE.Matrix4().makeScale(unit,unit,unit);
  let items=[...R.doc.querySelectorAll('build item')].map(it=>({id:attr(it,'objectid'),p:attr(it,'path')||root,tf:attr(it,'transform')}));
  if(!items.length)items=[...R.objs.keys()].map(id=>({id,p:root,tf:null}));
  const res=[];
  for(const it of items){
    const o=model(it.p).objs.get(it.id); if(!o||/support/i.test(attr(o,'type')||''))continue;
    const out=[]; collect(it.p,it.id,S.clone().multiply(matOf(it.tf)),out,0); if(!out.length)continue;
    const pos=new Float32Array(out.reduce((a,b)=>a+b.length,0)); let at=0; out.forEach(b=>{pos.set(b,at);at+=b.length});
    const M=model(it.p), pid=attr(o,'pid'), list=pid!==null?M.mats.get(pid):null, c=list?list[+attr(o,'pindex')||0]:null;
    res.push({name:attr(o,'name'),pos,col:c&&/^#[0-9a-f]{6}/i.test(c)?parseInt(c.slice(1,7),16):undefined});
  }
  if(!res.length)throw new Error('không tìm thấy hình học trong file 3MF');
  return res;
}
function from3MF(name,buf){
  const base=name.replace(/\.3mf$/i,''), list=parse3MF(buf);
  return list.map((o,i)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(o.pos,3));return makePart(list.length===1?base:(o.name?base+' – '+o.name:base+' '+(i+1)),g,o.col)});
}
