export function onRequestPost(context) {
    console.log(context)
    const { request } = context;
    const { url, method } = request;
    const ctx = JSON.stringify(context)
    const res = new Response(`${method} ${url} ${ctx}`, {
        status: 200,
        headers: {
            'content-type': 'text/plain',
        },
    });
    return res;
}