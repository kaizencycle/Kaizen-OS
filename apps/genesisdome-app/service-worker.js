
const CACHE = 'gdome-v1';
const OFFLINE_URLS = [
  '/',
  '/css/styles.css',
  '/js/main.js',
  '/assets/cycle0_sigil_vector.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(OFFLINE_URLS)));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match('/')))
  );
});

