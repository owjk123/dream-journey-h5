// Service Worker to intercept 4399 API calls
self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    const url = event.request.url;
    
    if (url.includes('4399.com') || url.includes('4399pk.com')) {
        console.log('[SW] Intercepted:', url.substring(0, 100));
        
        let responseText = '';
        let contentType = 'text/html';
        
        if (url.includes('get_time')) {
            // 返回纯数字时间戳（4399原版格式）
            responseText = Math.floor(Date.now() / 1000).toString();
            contentType = 'text/plain';
        } else if (url.includes('flash_ctrl_version')) {
            responseText = '<?xml version="1.0"?><data></data>';
            contentType = 'application/xml';
        } else if (url.includes('ctrl_mo') || url.includes('loading2')) {
            // 4399控制SWF - 返回空
            responseText = '';
            contentType = 'application/x-shockwave-flash';
        } else {
            responseText = '';
            contentType = 'text/plain';
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
    
    event.respondWith(
        fetch(event.request).catch(() => new Response('', { status: 404 }))
    );
});
