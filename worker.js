export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname.slice(1);
        
        // CORS headers - CHO PHÉP CẢ 2 DOMAIN
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };
        
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }
        
        // GET /stats
        if (path === 'stats') {
            try {
                const list = await env.URL_STORAGE.list();
                let totalLinks = 0;
                let totalClicks = 0;
                const topLinks = [];
                
                for (const key of list.keys) {
                    totalLinks = totalLinks + 1;
                    const data = await env.URL_STORAGE.get(key.name);
                    if (data) {
                        const linkData = JSON.parse(data);
                        const clicks = Number(linkData.clicks) || 0;
                        totalClicks = totalClicks + clicks;
                        topLinks.push({ code: key.name, clicks: clicks });
                    }
                }
                
                topLinks.sort((a, b) => b.clicks - a.clicks);
                
                return new Response(JSON.stringify({
                    totalLinks: totalLinks,
                    totalClicks: totalClicks,
                    todayClicks: 0,
                    topLinks: topLinks.slice(0, 5),
                    dailyClicks: []
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } catch (err) {
                return new Response(JSON.stringify({
                    totalLinks: 0, totalClicks: 0, todayClicks: 0, topLinks: [], dailyClicks: []
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }
        
        // GET /links
        if (path === 'links') {
            try {
                const links = [];
                const list = await env.URL_STORAGE.list();
                
                for (const key of list.keys) {
                    const data = await env.URL_STORAGE.get(key.name);
                    if (data) {
                        const linkData = JSON.parse(data);
                        links.push({
                            code: key.name,
                            original_url: linkData.original_url,
                            clicks: Number(linkData.clicks) || 0,
                            created_at: linkData.created_at
                        });
                    }
                }
                
                links.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                
                return new Response(JSON.stringify(links), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } catch (err) {
                return new Response(JSON.stringify([]), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }
        
        // POST /shorten
        if (request.method === 'POST' && path === 'shorten') {
            try {
                const { url: originalUrl, customCode } = await request.json();
                
                try {
                    new URL(originalUrl);
                } catch {
                    return new Response(JSON.stringify({ error: 'URL không hợp lệ' }), {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }
                
                let code = customCode;
                if (!code) {
                    code = Math.random().toString(36).substring(2, 8);
                }
                
                const existing = await env.URL_STORAGE.get(code);
                if (existing) {
                    return new Response(JSON.stringify({ error: 'Code đã tồn tại' }), {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }
                
                await env.URL_STORAGE.put(code, JSON.stringify({
                    original_url: originalUrl,
                    clicks: 0,
                    created_at: new Date().toISOString()
                }));
                
                return new Response(JSON.stringify({
                    shortUrl: `https://s.enactusftuhanoi.id.vn/${code}`,
                    code: code
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } catch (err) {
                return new Response(JSON.stringify({ error: err.message }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }
        
        // PUT /update/{code}
        if (request.method === 'PUT' && path.startsWith('update/')) {
            try {
                const code = path.split('/')[1];
                const { original_url } = await request.json();
                
                const existing = await env.URL_STORAGE.get(code);
                if (!existing) {
                    return new Response(JSON.stringify({ error: 'Link không tồn tại' }), {
                        status: 404,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }
                
                const linkData = JSON.parse(existing);
                linkData.original_url = original_url;
                
                await env.URL_STORAGE.put(code, JSON.stringify(linkData));
                
                return new Response(JSON.stringify({ success: true }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } catch (err) {
                return new Response(JSON.stringify({ error: err.message }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }
        
        // DELETE /delete/{code}
        if (request.method === 'DELETE' && path.startsWith('delete/')) {
            try {
                const code = path.split('/')[1];
                await env.URL_STORAGE.delete(code);
                return new Response(JSON.stringify({ success: true }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } catch (err) {
                return new Response(JSON.stringify({ error: err.message }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }
        
        // Redirect short link
        if (path && path !== 'favicon.ico' && path !== 'stats' && path !== 'links' && path !== 'shorten' && !path.startsWith('delete/') && !path.startsWith('update/')) {
            try {
                const data = await env.URL_STORAGE.get(path);
                if (data) {
                    const linkData = JSON.parse(data);
                    const newClicks = Number(linkData.clicks) + 1;
                    linkData.clicks = newClicks;
                    await env.URL_STORAGE.put(path, JSON.stringify(linkData));
                    return Response.redirect(linkData.original_url, 301);
                }
                return new Response('Link không tồn tại', { status: 404 });
            } catch (err) {
                return new Response(err.message, { status: 500 });
            }
        }
        
        // Trang chủ - lấy từ GitHub Pages
        const hostname = url.hostname;
        
        if (hostname === 'dev.enactusftuhanoi.id.vn') {
            return fetch('https://enactusftuhanoi.github.io/dev/', {
                headers: { 'Host': 'enactusftuhanoi.github.io' }
            });
        }
        
        return fetch('https://enactusftuhanoi.github.io/s/', {
            headers: { 'Host': 'enactusftuhanoi.github.io' }
        });
    }
};
