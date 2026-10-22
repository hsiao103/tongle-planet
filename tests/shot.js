const { chromium } = require('playwright-core');
const steps = JSON.parse(process.argv[2] || '[]');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox']});
 const p=await b.newPage({viewport:{width:1200,height:720}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if((m.type()==='error'||m.type()==='warning')&&!/GL Driver|ERR_TUNNEL/.test(m.text()))errs.push(m.text().slice(0,300));});
 const t0=Date.now();
 await p.goto('file://'+process.cwd()+'/test.html'); 
 await p.waitForFunction(()=>window.__bake&&window.__school,null,{timeout:120000}).catch(e=>errs.push('wait '+e.message));
 console.log('load ms',Date.now()-t0, JSON.stringify(await p.evaluate(()=>window.__bake)));
 await p.waitForTimeout(2500);
 for(const s of steps){ if(s.reload){await p.reload();await p.waitForFunction(()=>window.__bake&&window.__school,null,{timeout:120000});await p.waitForTimeout(2500);} if(s.js) await p.evaluate(s.js); if(s.wait) await p.waitForTimeout(s.wait); if(s.shot){ await p.screenshot({path:s.shot}); console.log('shot',s.shot);} if(s.eval){console.log(s.eval, JSON.stringify(await p.evaluate(s.eval)));} }
 console.log('errs',JSON.stringify(errs.slice(0,8)));
 await b.close();})();
