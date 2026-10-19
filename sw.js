// Chauffes Pro — service worker : l'app fonctionne hors ligne.
const VERSION='chauffes-pro-v3.21.0';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-512-maskable.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(VERSION).then(c=>Promise.all(SHELL.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>(k.startsWith('chauffes-pro-v')||k.startsWith('chauffespro-v'))&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open('chauffes-fonts').then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>{ c.put(req,r.clone()); return r; }).catch(()=>hit))));
    return;
  }
  if(url.origin!==location.origin) return;
  const scope=new URL(self.registration.scope).pathname; if(!url.pathname.startsWith(scope)) return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req.url,{cache:'no-cache',credentials:'same-origin'}).then(r=>{ if(r.ok){ const cp=r.clone(); caches.open(VERSION).then(c=>c.put('./index.html',cp)); } return r; }).catch(()=>caches.open(VERSION).then(c=>c.match('./index.html',{ignoreSearch:true}))));
    return;
  }
  e.respondWith(caches.open(VERSION).then(c=>c.match(req,{ignoreSearch:true})).then(hit=>hit||fetch(req)));
});
