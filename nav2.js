const { chromium } = require('playwright-core');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox']});
 const p=await b.newPage({viewport:{width:1100,height:700}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.cwd()+'/test.html'); await p.waitForFunction(()=>window.__bake,null,{timeout:120000}); await p.waitForTimeout(3000);
 const r=await p.evaluate(()=>{const g=__nav.NPLACES.find(x=>x.name==='校門');const bad=[];let ok=0;
  for(const d of __nav.NPLACES){__school.teleport(g.x,0.1,g.z+4);__nav.navStart(d);const r=__nav.route;
   if(!r||r.none){bad.push(d.name+'/'+d.sub);continue;}
   // verify with real blocked() along segments
   let w=0;for(let i=0;i<r.pts.length-1;i++){const a=r.pts[i],c=r.pts[i+1];if(a.lv!==c.lv)continue;const y=a.lv*3.4+0.1;for(let t=0;t<=1;t+=0.02){if(blocked(a.x+(c.x-a.x)*t,a.z+(c.z-a.z)*t,y)){w++;bad.push("  seg"+i+"/"+(r.pts.length-2)+" t"+t.toFixed(2)+" len"+Math.hypot(c.x-a.x,c.z-a.z).toFixed(1)+" "+d.name);break;}}}
   if(w)bad.push('WALL '+d.name+'/'+d.sub+' x'+w);else ok++;}
  return {ok,bad};});
 console.log(JSON.stringify(r),errs);
 await b.close();})();
