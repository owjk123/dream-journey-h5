// Service Worker to intercept 4399 API calls and return mock data
self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    const url = event.request.url;
    
    // 拦截4399相关的所有请求
    if (url.includes('4399.com') || url.includes('4399pk.com')) {
        console.log('[SW] Intercepted:', url.substring(0, 100));
        
        let responseText = '';
        let contentType = 'text/plain';
        
        if (url.includes('get_time')) {
            // 返回JSON格式的时间戳（游戏期望有time属性的对象）
            responseText = JSON.stringify({ time: Math.floor(Date.now() / 1000) });
            contentType = 'application/json';
        } else if (url.includes('flash_ctrl_version')) {
            responseText = '<?xml version="1.0" encoding="utf-8"?><data></data>';
            contentType = 'application/xml';
        } else {
            responseText = '{}';
            contentType = 'application/json';
        }
        
        event.respondWith(new Response(responseText, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': '*',
            }
        }));
        return;
    }
    
    // 其他请求正常通过
    event.respondWith(
        fetch(event.request).catch(() => new Response('', { status: 404 }))
    );
});
