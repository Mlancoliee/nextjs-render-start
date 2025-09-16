export function onRequest(context) {
    const { url } = context.request;
    if(url.endsWith('/redirect')) {
        return Response.redirect('/test', 302)
    }
    return
}