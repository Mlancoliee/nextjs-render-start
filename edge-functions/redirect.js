export function onRequest(context) {
  const {request} = context;
  const geo = request.eo.geo;
  const res = JSON.stringify({
    geo: geo,
  });
  const cookies = new Cookies('test=hello',false);
  const resp = new Response(res, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
  resp.setCookies(cookies)
  return resp;
}