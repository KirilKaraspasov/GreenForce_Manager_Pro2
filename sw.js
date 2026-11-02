'use strict';
const PREFIX='greenforce-pro-'+self.registration.scope+'-';
const CACHE=PREFIX+'v1.0.0';
const FILES=['./','./index.html','./style.css','./app.js','./pdf.js','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png','./assets/garden.jpg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith((async()=>{const cache=await caches.open(CACHE);const hit=await cache.match(e.request,{ignoreSearch:true});if(hit)return hit;try{return await fetch(e.request)}catch(err){if(e.request.mode==='navigate')return cache.match('./index.html');return Response.error()}})())});
