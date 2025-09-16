export function onRequestPost(context) {
    console.log(context)
    const { request } = context;
    const { url, method } = request;
    const ctx = JSON.stringify(context)
    const cookies = new Cookies('ssid=helloworld; expires=Sun, 10-Dec-2023 03:10:01 GMT; path=/; domain=.tencentcloud.com; samesite=.tencentcloud.com', true);
    const res = new Response(`${method} ${url} ${ctx}`, {
        status: 200,
        headers: {
            'content-type': 'text/plain',
        },
    });
    // res.setCookies(cookies)
    return res;
}

export function onRequestGet(context) {
    return Response.redirect('/geo', 302)
}