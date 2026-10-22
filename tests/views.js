const { chromium } = require('playwright-core');
const views = JSON.parse(process.argv[2]);
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox']});
 const p=await b.newPage({viewport:{width:1000,height:620}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.cwd()+'/test.html'); await p.waitForFunction(()=>window.__npcs&&__npcs.length>8,null,{timeout:120000}); await p.waitForTimeout(2000);
 await p.evaluate(()=>{document.getElementById('iGo').click(); ['modes','search','mini','nav'].forEach(i=>{const e=document.getElementById(i); if(e) e.style.display='none'}); __school.GT.mode='day'; });
 for(const v of views){ await p.evaluate(v=>{const S=__school; S.teleport(v.x,0.1,v.z,0,-20); S.PL.yaw=v.yaw||0; S.cam.d=v.d;S.cam.curD=v.d;S.cam.elev=v.e; if(v.fwyaw!==undefined){S.PL.yaw=v.fwyaw;} },v); await p.waitForTimeout(v.w||6000); await p.screenshot({path:v.f}); console.log('shot',v.f);}
 console.log(JSON.stringify(errs)); await b.close();})();
