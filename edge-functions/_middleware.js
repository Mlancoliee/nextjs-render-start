export async function onRequest(context) {
    console.log('[root]_middleware start');
    const res = await context.next();
    console.log('[root]_middleware after')
    res.headers.set('x-root-mw', '1');
    return res;
}