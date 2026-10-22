window.claude={use:async(n)=>{ if(n!=='room')return null; const bc=new BroadcastChannel('mockroom'),me='p'+Math.random().toString(36).slice(2,8); const P=new Map(); let mine={}; const ls=[];
 const snap=()=>{const a=[{peer:me,by:null,isMe:true,sameTab:true,kind:'viewer',guest:false,presence:mine,updatedAt:Date.now()}]; P.forEach((v,k)=>a.push({peer:k,by:null,isMe:false,sameTab:false,kind:'viewer',guest:false,presence:v.p,updatedAt:v.t})); return a;};
 bc.onmessage=e=>{const m=e.data; if(m.t==='pres'){P.set(m.id,{p:m.p,t:Date.now()});} else if(m.t==='leave'){P.delete(m.id);} else if(m.t==='hello'){bc.postMessage({t:'pres',id:me,p:mine});}};
 addEventListener('beforeunload',()=>bc.postMessage({t:'leave',id:me}));
 bc.postMessage({t:'hello'});
 return {presence:async(patch)=>{mine=Object.assign({},mine,patch);bc.postMessage({t:'pres',id:me,p:mine});},peers:()=>snap(),onPeers:(f)=>()=>{},connected:()=>true,onConnection:()=>()=>{},emit:async()=>{},on:()=>()=>{}};}};
