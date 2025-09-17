export function onRequest(context) {
  const {request} = context;
  const geo = request.eo.geo;
  const cookies = new Cookies()
  const coo = cookies.get('test')
  const url = new URL(request.url)
  cookies.set('set1', 'aaaaa', {httpOnly: true, path: '/'})

  const res = JSON.stringify({
    geo: geo,
    coo,
    url: url.pathname
  });

  const resp = new Response(res, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
//   resp.setCookies(cookies)
  return resp;
}