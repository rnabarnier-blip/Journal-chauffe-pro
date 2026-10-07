// Chauffes Pro — service worker : l'app fonctionne hors ligne.
// Tous ses caches commencent par « chauffespro- » : il ne touche jamais aux caches
// du Journal de chauffes d'origine (même adresse github.io).
const VERSION='chauffespro-v2.0.0';
const FONTS='chauffespro-fonts';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-512-maskable.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('chauffespro-')&&k!==VERSION&&k!==FONTS).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(FONTS).then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>{ c.put(req,r.clone()); return r; }).catch(()=>hit))));
    return;
  }
  if(url.origin!==location.origin) return;
  if(!url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req.url,{cache:'no-cache',credentials:'same-origin'}).then(r=>{ if(r.ok){ const cp=r.clone(); caches.open(VERSION).then(c=>c.put(new URL('./index.html',self.registration.scope).href,cp)); } return r; }).catch(()=>caches.open(VERSION).then(c=>c.match(new URL('./index.html',self.registration.scope).href,{ignoreSearch:true}))));
    return;
  }
  e.respondWith(caches.open(VERSION).then(c=>c.match(req,{ignoreSearch:true})).then(hit=>hit||fetch(req)));
});
