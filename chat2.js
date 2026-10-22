const { chromium } = require('playwright-core'); const fs=require('fs');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:480,height:360}}); await ctx.addInitScript(fs.readFileSync('mocksb.js','utf8'));
 const mk=async(nick,x,z,kind)=>{const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.addInitScript(([n,k])=>{try{localStorage.setItem('tongle_nick',n);localStorage.setItem('tl3d_char',k)}catch(e){}},[nick,kind]);
  await p.goto('http://127.0.0.1:8765/test.html',{waitUntil:'domcontentloaded',timeout:200000}); await p.waitForFunction(()=>window.__npcs&&__npcs.length>8&&window.__mp&&window.__chat,null,{timeout:300000}); await p.waitForTimeout(1500);
  await p.evaluate(([x,z])=>{document.getElementById('iGo').click();__school.GT.mode='day';__school.teleport(x,0.1,z,0,-20);},[x,z]); p.errs=errs; return p;};
 const A=await mk('小明',27,-24,'boy'); const B=await mk('阿花',29,-22,'girl');
 for(const p of [A,B]) await p.evaluate(()=>document.getElementById('bOnline').click());
 await A.waitForTimeout(6000);
 await B.evaluate(()=>{const S=__school;S.teleport(28.5,0.1,-23.2,27,-24);S.cam.d=9;S.cam.curD=9;S.cam.elev=0.3;});
 await A.evaluate(()=>{document.getElementById('hChat').click();});
 await A.fill('#chIn','大家好！今天一起去操場玩吧，我在校門口等你們喔'); await A.keyboard.press('Enter'); await B.waitForTimeout(1800);
 await B.screenshot({path:'chat_bub.png'});
 console.log(await B.evaluate(()=>{const b=__chat.CHAT.bub[0];if(!b)return 'nobub';const s=b.s;const v=s.getWorldPosition(new THREE.Vector3());return JSON.stringify({id:b.id,t:b.t,vis:s.visible,sc:[s.scale.x,s.scale.y],pos:s.position.toArray(),world:v.toArray(),op:s.material.opacity,layers:s.layers.mask,camLayers:__school.camera.layers.mask,parent:s.parent&&s.parent.type})}));
 console.log(A.errs,B.errs); await b.close();})();
