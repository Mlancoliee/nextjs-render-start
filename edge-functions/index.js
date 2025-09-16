export function onRequest(context) {
    console.log(context)
    const { request } = context;
    const { url, method } = request;
    const res = new Response(`${method} ${url}`, {
        status: 200,
        headers: {
            'content-type': 'text/plain',
        },
    });
    return res;
}