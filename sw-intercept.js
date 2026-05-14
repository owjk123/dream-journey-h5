self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', event => {
    const url = event.request.url;
    
    if (url.includes('4399.com') || url.includes('4399pk.com')) {
        let responseText = '';
        let contentType = 'application/json';
        
        if (url.includes('get_time')) {
            responseText = JSON.stringify({ time: Math.floor(Date.now() / 1000) });
        } else if (url.includes('flash_ctrl_version')) {
            responseText = '<?xml version="1.0"?><data></data>';
            contentType = 'application/xml';
        } else {
            responseText = '{}';
        }
        
        event.respondWith(new Response(responseText, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
            }
        }));
        return;
    }
    
    event.respondWith(
        fetch(event.request).catch(() => new Response('', { status: 404 }))
    );
});
