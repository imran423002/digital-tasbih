const CACHE_VERSION='noor-shell-v19';
const DATA_CACHE='noor-offline-data-v19';
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const c=await caches.open(CACHE_VERSION);
 await Promise.all(['./','./index.html'].map(async u=>{try{const r=await fetch(u);if(r.ok)await c.put(u,r)}catch(e){}}));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(k=>k.startsWith('noor-shell-')&&k!==CACHE_VERSION).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin==='https://api.alquran.cloud'||url.origin==='https://api.aladhan.com'){
  event.respondWith((async()=>{
   const c=await caches.open(DATA_CACHE);
   try{const fresh=await fetch(req);if(fresh.ok)await c.put(req,fresh.clone());return fresh}
   catch(e){return await c.match(req)||new Response(JSON.stringify({code:503,status:'OFFLINE'}),{status:503,headers:{'Content-Type':'application/json'}})}
  })());return;
 }
 if(url.origin===self.location.origin){
  event.respondWith((async()=>{
   const c=await caches.open(CACHE_VERSION);
   try{const fresh=await fetch(req);if(fresh.ok)c.put(req,fresh.clone());return fresh}
   catch(e){return await c.match(req)||await c.match('./index.html')||new Response('Offline',{status:503})}
  })());
 }
});
