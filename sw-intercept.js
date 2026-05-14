// Service Worker v2 - 完整4399 API Mock
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', event => {
    const url = event.request.url;
    
    // 拦截所有4399相关请求
    if (url.includes('4399.com') || url.includes('4399pk.com')) {
        let responseText = '';
        let contentType = 'application/json';
        
        if (url.includes('get_time')) {
            // 关键修复: 返回日期字符串格式，不是数字！
            const now = new Date();
            const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
            responseText = JSON.stringify({ time: ts });
        } else if (url.includes('ac=get_list') || url.includes('ac=getlist')) {
            // 存档列表 - 返回空存档
            responseText = JSON.stringify({ status: 1, data: [] });
        } else if (url.includes('ac=get') || url.includes('ac=save_get')) {
            // 获取存档 - 返回空
            responseText = JSON.stringify({ status: 0, data: null });
        } else if (url.includes('ac=set') || url.includes('ac=save_set')) {
            // 保存存档 - 返回成功
            responseText = JSON.stringify({ status: 1 });
        } else if (url.includes('flash_ctrl_version')) {
            responseText = '<?xml version="1.0"?><data><v>5</v></data>';
            contentType = 'application/xml';
        } else if (url.includes('activation') || url.includes('huodong') || url.includes('jifen')) {
            // 活动相关 - 返回空
            responseText = JSON.stringify({ status: 0 });
        } else if (url.includes('forums') || url.includes('feedback') || url.includes('r.php')) {
            // 论坛/反馈 - 返回空HTML
            contentType = 'text/html';
            responseText = '<html><body></body></html>';
        } else {
            // 其他4399请求 - 返回成功空对象
            responseText = JSON.stringify({ status: 1 });
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
