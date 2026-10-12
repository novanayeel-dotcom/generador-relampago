const CACHE="relampago-static-v2";
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["/","/manifest.webmanifest"]))));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET"||new URL(e.request.url).pathname.startsWith("/api/"))return;
 e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});