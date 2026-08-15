/* Michi — local-first PWA shell. */
const CACHE_NAME = "michi-shell-v1-redesign";
const RUNTIME_CACHE = "michi-runtime-v1-redesign";
const TILE_CACHE = "michi-maptiles-v1-redesign";
const LEGACY_CACHE_PREFIX = "ichigo-"; // one-release cleanup for pre-Michi installs

const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css?v=20260815-michi-redesign-1",
  "./michi.css?v=20260815-michi-redesign-1",
  "./michi-ui.css?v=20260815-michi-redesign-1",
  "./app.js?v=20260815-michi-redesign-1",
  "./michi.js?v=20260815-michi-redesign-1",
  "./data/data.js?v=20260815-michi-redesign-1",
  "./data/db.js?v=20260815-michi-redesign-1",
  "./manifest.json",
  "./manifest.json?v=20260815-michi-redesign-1",
  "./icons/apple-touch-icon-v41.png",
  "./icons/icon-192-v41.png",
  "./icons/icon-512-v41.png",
  "./icons/icon-maskable-512-v41.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(APP_SHELL.map(url => cache.add(url).catch(error => {
        console.warn("Michi shell cache skipped", url, error);
        return null;
      })))
    )
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key =>
          (key.startsWith("michi-") || key.startsWith(LEGACY_CACHE_PREFIX)) &&
          ![CACHE_NAME, RUNTIME_CACHE, TILE_CACHE].includes(key)
        ).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
      .then(async () => {
        const clients = await self.clients.matchAll({type:"window"});
        clients.forEach(client => {
          client.postMessage({type:"MICHI_SW_ACTIVATED",cache:CACHE_NAME});
          /* Compatibility event for the inherited update listener. */
          client.postMessage({type:"ICHIGO_SW_ACTIVATED",cache:CACHE_NAME});
        });
      })
  );
});

async function trimCache(name,maxEntries) {
  const cache=await caches.open(name);
  const keys=await cache.keys();
  if(keys.length<=maxEntries)return;
  await Promise.all(keys.slice(0,keys.length-maxEntries).map(k=>cache.delete(k)));
}

async function cacheResponse(cacheName,request,response) {
  if(!response || (!response.ok && response.type!=="opaque")) return response;
  const cache=await caches.open(cacheName);
  await cache.put(request,response.clone());
  return response;
}

self.addEventListener("fetch", event => {
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  const sameOrigin=url.origin===self.location.origin;

  if(sameOrigin){
    const isIcon=url.pathname.includes("/icons/");
    const isManifest=url.pathname.endsWith("/manifest.json");

    if(isIcon||isManifest){
      event.respondWith(
        fetch(event.request)
          .then(r=>cacheResponse(CACHE_NAME,event.request,r))
          .catch(async()=>await caches.match(event.request)||await caches.match(event.request,{ignoreSearch:true}))
      );
      return;
    }

    if(event.request.mode==="navigate"){
      event.respondWith(
        fetch(event.request)
          .then(async r=>{await cacheResponse(CACHE_NAME,new Request("./index.html"),r.clone());return r})
          .catch(async()=>await caches.match("./index.html")||await caches.match("./"))
      );
      return;
    }

    event.respondWith(
      caches.match(event.request).then(cached=>{
        if(cached)return cached;
        return fetch(event.request).then(r=>cacheResponse(CACHE_NAME,event.request,r));
      })
    );
    return;
  }

  if(url.hostname==="unpkg.com"){
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async cache=>{
        const cached=await cache.match(event.request);
        const network=fetch(event.request).then(async r=>{if(r.ok||r.type==="opaque")await cache.put(event.request,r.clone());return r}).catch(()=>null);
        return cached || await network || new Response("",{status:504,statusText:"Offline"});
      })
    );
    return;
  }

  if(url.hostname==="tile.openstreetmap.org"){
    event.respondWith(
      fetch(event.request)
        .then(async r=>{await cacheResponse(TILE_CACHE,event.request,r);trimCache(TILE_CACHE,120);return r})
        .catch(async()=>await caches.match(event.request)||new Response("",{status:504,statusText:"Offline tile"}))
    );
  }
});

self.addEventListener("message", event => {
  if(event.data?.type==="SKIP_WAITING")self.skipWaiting();
  if(event.data?.type==="CLEAR_RUNTIME")event.waitUntil(Promise.all([caches.delete(RUNTIME_CACHE),caches.delete(TILE_CACHE)]));
  if(event.data?.type==="WARM_SHELL")event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
});

/* Deployment marker: Michi redesign published from main on 2026-08-15. */
