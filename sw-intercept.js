// Service Worker v3 - 完整4399 API Mock + game_core.swf直载支持
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', event => {
    const url = event.request.url;
    
    // 拦截所有4399相关请求
    if (url.includes('4399.com') || url.includes('4399pk.com')) {
        let responseText = '';
        let contentType = 'application/json';
        
        if (url.includes('get_time')) {
            const now = new Date();
            const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
            responseText = JSON.stringify({ time: ts });
        } else if (url.includes('ac=get_list') || url.includes('ac=getlist')) {
            responseText = JSON.stringify({ status: 1, data: [] });
        } else if (url.includes('ac=get') || url.includes('ac=save_get')) {
            responseText = JSON.stringify({ status: 0, data: null });
        } else if (url.includes('ac=set') || url.includes('ac=save_set')) {
            responseText = JSON.stringify({ status: 1 });
        } else if (url.includes('flash_ctrl_version')) {
            responseText = '<?xml version="1.0"?><data><v>5</v></data>';
            contentType = 'application/xml';
        } else if (url.includes('activation') || url.includes('huodong') || url.includes('jifen')) {
            responseText = JSON.stringify({ status: 0 });
        } else if (url.includes('forums') || url.includes('feedback') || url.includes('r.php')) {
            contentType = 'text/html';
            responseText = '<html><body></body></html>';
        } else {
            responseText = JSON.stringify({ status: 1 });
        }
        
        event.respondWith(new Response(responseText, {
            status: 200,
            headers: { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' }
        }));
        return;
    }
    
    // ctrl_mo_v5.swf请求也拦截 - 返回空SWF（因为game_core.swf直载不需要ctrl）
    if (url.includes('ctrl_mo_v5.swf') || url.includes('ctrl_mo')) {
        console.log('[SW] Intercepting ctrl_mo request:', url);
        // 返回一个最小的空SWF（FWS格式，1帧空白）
        const emptySWF = new Uint8Array([0x46,0x57,0x53,0x09,0x08,0x00,0x00,0x00,0x01,0x00,0x43,0x02,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x01,0x00,0x00]);
        event.respondWith(new Response(emptySWF, {
            status: 200,
            headers: { 'Content-Type': 'application/x-shockwave-flash', 'Access-Control-Allow-Origin': '*' }
        }));
        return;
    }
    
    // 其他请求正常转发
    event.respondWith(
        fetch(event.request).catch(() => new Response('', { status: 404 }))
    );
});
