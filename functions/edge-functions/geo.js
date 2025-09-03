export function onRequestPost({request}) {
  const geo = request.eo.geo;
  const res = JSON.stringify({
    geo: geo,
  });

  return new Response(res, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function onRequestGet({request}) {
  const geo = request.eo.geo;
  const res = JSON.stringify({
    geo: geo,
  });

  return new Response(res, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function onRequestPut({request}) {
  const geo = request.eo.geo;
  const res = JSON.stringify({
    geo: geo,
  });

  return new Response(res, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function onRequestPatch({request}) {
  const geo = request.eo.geo;
  const res = JSON.stringify({
    geo: geo,
  });

  return new Response(res, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function onRequestDelete({request}) {
  const geo = request.eo.geo;
  const res = JSON.stringify({
    geo: geo,
  });

  return new Response(res, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function onRequestHead({request}) {
  // HEAD 请求不返回 Body，仅返回头部
  return new Response(null, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function onRequestOptions() {
  // 处理 CORS 预检
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  });
}