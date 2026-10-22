const { chromium } = require('playwright-core');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox']});
 const p=await b.newPage({viewport:{width:1000,height:620}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+process.cwd()+'/test.html'); await p.waitForFunction(()=>window.__npcs&&__npcs.length>8,null,{timeout:120000}); await p.waitForTimeout(2000);
 await p.evaluate(()=>{document.getElementById('iGo').click();__school.GT.mode='day';});
 await p.waitForTimeout(500);
 await p.click('#bEd'); await p.waitForTimeout(300); await p.screenshot({path:'hw_menu.png'});
 await p.evaluate(()=>{[...document.querySelectorAll('#edpList button')].find(b=>b.textContent==='切換'&&!b.disabled).click();}); await p.waitForTimeout(2500);
 const info=await p.evaluate(()=>({pumps:__hw.HW.pumps.length,sk:__hw.HW.skulls.length,mons:__hw.HW.mons.map(m=>[m.name,+m.x.toFixed(1),+m.z.toFixed(1),+m.y.toFixed(2)]),bats:__hw.HW.bats.length}));
 console.log(JSON.stringify(info),JSON.stringify(errs));
if(!info.pumps){await b.close();return;}
 for(const [i,m] of info.mons.entries()){
  await p.evaluate(([x,z])=>{const S=__school; S.teleport(x,0.1,z+4,0,-20); S.cam.d=7;S.cam.curD=7;S.cam.elev=0.25;},[m[1],m[2]]); await p.waitForTimeout(2500); await p.screenshot({path:'hw_m'+i+'.png'});
 }
 // 南瓜與骷髏
 await p.evaluate(()=>{const o=__hw.HW.pumps[4];const S=__school; S.teleport(o.x,0.1,o.z+3,0,-20); S.cam.d=7;S.cam.curD=7;S.cam.elev=0.45;}); await p.waitForTimeout(2500); await p.screenshot({path:'hw_p.png'});
 await p.evaluate(()=>{const o=__hw.HW.skulls[2];const S=__school; S.teleport(o.x,0.1,o.z+3,0,-20); S.cam.d=5;S.cam.curD=5;S.cam.elev=0.4;}); await p.waitForTimeout(2500); await p.screenshot({path:'hw_s.png'});
 await p.evaluate(()=>{const S=__school; S.cam.d=22;S.cam.curD=22;S.cam.elev=0.7;}); await p.waitForTimeout(2500); await p.screenshot({path:'hw_bat.png'});
 console.log(JSON.stringify(errs)); await b.close();})();
