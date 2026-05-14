// Service Worker to intercept 4399 API calls and return mock data
const MOCK_RESPONSES = {
    'get_time': Math.floor(Date.now() / 1000).toString(),
    'flash_ctrl_version': '<?xml version="1.0" encoding="utf-8"?><data></data>',
};

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
            // 返回时间戳
            responseText = Math.floor(Date.now() / 1000).toString();
            contentType = 'text/plain';
        } else if (url.includes('flash_ctrl_version')) {
            responseText = '<?xml version="1.0" encoding="utf-8"?><data></data>';
            contentType = 'application/xml';
        } else {
            // 其他4399请求返回空JSON
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
