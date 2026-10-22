const { chromium } = require('playwright-core');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox']});
 const p=await b.newPage({viewport:{width:200,height:120}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.cwd()+'/test.html'); await p.waitForFunction(()=>window.__school,null,{timeout:120000}); await p.waitForTimeout(2000);
 const r=await p.evaluate(()=>{const S=__school,out=[];
  for(const rad of [3,30,80,150,215]) for(let a=0;a<360;a+=45) for(let yd=0;yd<360;yd+=45){
   const x=S.PC.x+rad*Math.cos(a*Math.PI/180), z=S.PC.z+rad*Math.sin(a*Math.PI/180), yaw=yd*Math.PI/180;
   S.PL.x=x;S.PL.z=z;S.PL.yaw=yaw;S.fwFromYaw();
   const fw=S.cam.fw.clone(); const sx=S.PL.x,sz=S.PL.z;
   S.moveStep(1,0,0.02,1); const ix=S.PL.ix,iz=S.PL.iz; S.PL.x=sx;S.PL.z=sz;
   // 實際球面位移方向
   const A=new THREE.Vector3(),B=new THREE.Vector3(); S.sph(sx,0,sz,A); S.sph(sx+ix*0.5,0,sz+iz*0.5,B); const mv=B.sub(A).normalize();
   const fd=S.sphFace(sx,sz,ix,iz,[0,0]); const face=Math.atan2(-fd[0],-fd[1]);
   const q=new THREE.Quaternion(); S.frameQuat(sx,sz,q);
   const f=new THREE.Vector3(-Math.sin(face),0,-Math.cos(face)).applyQuaternion(q);
   out.push({rad,a,yd,fwVsMove:+(fw.angleTo(mv)*57.3).toFixed(1),faceVsFw:+(f.angleTo(fw)*57.3).toFixed(1)});}
  return out;});
 const bad=r.filter(o=>o.fwVsMove>3||o.faceVsFw>3); const byRad={}; r.forEach(o=>{byRad[o.rad]=Math.max(byRad[o.rad]||0,o.faceVsFw,o.fwVsMove)});
 console.log(JSON.stringify(byRad), bad.length, JSON.stringify(bad.slice(0,6)), errs); await b.close();})();
