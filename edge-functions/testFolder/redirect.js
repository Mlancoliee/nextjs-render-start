export function onRequest(context) {
  const {request} = context;
  const geo = request.eo.geo;
  const cookies = new Cookies()
  const coo = cookies.get('test')
  cookies.set('set1', 'aaaaa', {httpOnly: true, path: '/'})

  const res = JSON.stringify({
    geo: geo,
    coo
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