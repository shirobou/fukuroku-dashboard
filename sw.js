// Service Worker - ふくろく営業マップ PWA
const CACHE_VERSION = 'fukuroku-map-v2';
const CACHE_FILES = [
  './',
  './sales-map.html',
  './manifest.json',
  './icon.svg'
];

// Install: キャッシュにファイルを保存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CACHE_FILES))
  );
  self.skipWaiting();
});

// Activate: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch: ネットワークファースト（オフライン時のみキャッシュ使用）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then((response) => {
      // ネットワーク成功 → キャッシュを更新して返す
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => {
      // ネットワーク失敗 → キャッシュから返す
      return caches.match(event.request).then((cached) => {
        return cached || new Response('オフラインです。ネットワーク接続を確認してください。', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});
