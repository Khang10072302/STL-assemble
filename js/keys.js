'use strict';
// Phím tắt (W/E/R, L, Delete, Esc, Ctrl+Z/Y/G)
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'&&e.target.type==='number')return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveProject();return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='g'){e.preventDefault();e.shiftKey?ungroupSel():groupSel();return}
  if(e.key==='w')setMode('translate'); if(e.key==='l')$('alignBtn').click(); if(e.key==='e')setMode('rotate'); if(e.key==='r')setMode('scale');
  if((e.key==='Delete'||e.key==='Backspace')&&selSet.size){e.preventDefault();deleteSelected()}
  if(e.key==='Escape')snapReset();
});
