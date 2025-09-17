export function onRequest(context) {
    const url = new URL(context.request.url);
    if(url.pathname === '/redirect') {
        return Response.redirect('/test', 302)
    }
    return new Response('Hello from a JavaScript Edge Function!', {
        status: 200,
        headers: {
            'content-type': 'text/plain',
            'set-cookie': 'test=index; Path=/; HttpOnly',
        },
    });
}