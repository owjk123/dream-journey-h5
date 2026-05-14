// Service Worker to intercept 4399 API calls
self.addEventListener('install', event => {
    console.log('[SW] Installed');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[SW] Activated');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    const url = event.request.url;
    
    // 拦截4399 API请求
    if (url.includes('4399.com') || url.includes('4399pk.com')) {
        console.log('[SW] Intercepted:', url.substring(0, 80));
        
        // 返回假数据
        if (url.includes('get_time')) {
            event.respondWith(new Response(
                JSON.stringify({ time: Date.now() }),
                { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            ));
        } else if (url.includes('flash_ctrl_version')) {
            event.respondWith(new Response(
                '<?xml version="1.0" encoding="utf-8"?><data></data>',
                { headers: { 'Content-Type': 'application/xml', 'Access-Control-Allow-Origin': '*' } }
            ));
        } else {
            // 其他4399请求返回空
            event.respondWith(new Response('', {
                headers: { 'Access-Control-Allow-Origin': '*' }
            }));
        }
        return;
    }
    
    // 其他请求正常通过
    event.respondWith(fetch(event.request).catch(() => new Response('', {
        status: 404
    })));
});
