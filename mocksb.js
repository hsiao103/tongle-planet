window.TONGLE_SUPABASE={url:'https://x.supabase.co',key:'anon-test'};
window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'u'}}}}),signInWithOAuth:async()=>{window.__oauth=1;}},
 channel:(name,cfg)=>{const bc=new BroadcastChannel('sb-'+name);const hs={};const pres=new Map();const key=cfg.config.presence.key;let sub=null;
  const api={on(t,f,cb){(hs[t+':'+(f.event)]=hs[t+':'+(f.event)]||[]).push(cb);return api;},
   subscribe(cb){sub=cb;setTimeout(()=>cb('SUBSCRIBED'),50);return api;},
   async track(p){bc.postMessage({t:'join',key,p});},
   presenceState(){const o={};pres.forEach((v,k)=>o[k]=[v]);return o;},
   send(m){bc.postMessage({t:'bc',m});},
   async unsubscribe(){bc.postMessage({t:'leave',key});bc.close();}};
  bc.onmessage=e=>{const d=e.data; if(d.t==='bc'){(hs['broadcast:'+d.m.event]||[]).forEach(f=>f({payload:d.m.payload}));} else if(d.t==='join'){pres.set(d.key,d.p);(hs['presence:sync']||[]).forEach(f=>f());if(!d.r)bc.postMessage({t:'join',key,p:{nm:'x'},r:1});} else if(d.t==='leave'){pres.delete(d.key);(hs['presence:leave']||[]).forEach(f=>f({key:d.key,leftPresences:[{}]}));(hs['presence:sync']||[]).forEach(f=>f());}};
  return api;}})};
