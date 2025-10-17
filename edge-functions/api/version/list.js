  // edge-functions/limit.ts
  async function CheckEnvLimit(request, params, env) {
    if (env.PYPI_REPO_SLUG === null || env.PYPI_REPO_SLUG === "") {
      return new Response(JSON.stringify({ code: 2e3, msg: "\u670D\u52A1\u4E0D\u53EF\u7528" }), { status: 200 });
    }
    if (env.PYPI_PACK_NAME_IMG === null || env.PYPI_PACK_NAME_IMG === "") {
      return new Response(JSON.stringify({ code: 2001, msg: "\u670D\u52A1\u4E0D\u53EF\u7528" }), { status: 200 });
    }
    if (env.PYPI_PACK_NAME_OTA === null || env.PYPI_PACK_NAME_OTA === "") {
      return new Response(JSON.stringify({ code: 2002, msg: "\u670D\u52A1\u4E0D\u53EF\u7528" }), { status: 200 });
    }
    if (env.PYPI_PACK_NAME_BACKUP === null || env.PYPI_PACK_NAME_BACKUP === "") {
      return new Response(JSON.stringify({ code: 2003, msg: "\u670D\u52A1\u4E0D\u53EF\u7528" }), { status: 200 });
    }
    if (env.CNB_PASSWORD === null || env.CNB_PASSWORD === "") {
      return new Response(JSON.stringify({ code: 2004, msg: "\u670D\u52A1\u4E0D\u53EF\u7528" }), { status: 200 });
    }
    if (env.CNB_USERNAME === null || env.CNB_USERNAME === "") {
      return new Response(JSON.stringify({ code: 2005, msg: "\u670D\u52A1\u4E0D\u53EF\u7528" }), { status: 200 });
    }
    if (env.KV_USER_KEY === null || env.KV_USER_KEY === "") {
      return new Response(JSON.stringify({ code: 2006, msg: "\u670D\u52A1\u4E0D\u53EF\u7528" }), { status: 200 });
    }
    if (env.KV_SESSION_KEY === null || env.KV_SESSION_KEY === "") {
      return new Response(JSON.stringify({ code: 2007, msg: "\u670D\u52A1\u4E0D\u53EF\u7528" }), { status: 200 });
    }
    if (env.KV_RATE_LIMIT_KEY === null || env.KV_RATE_LIMIT_KEY === "") {
      return new Response(JSON.stringify({ code: 2008, msg: "\u670D\u52A1\u4E0D\u53EF\u7528" }), { status: 200 });
    }
    return null;
  }
  async function CheckRateLimit(request, params, env) {
    const MAX_REQUESTS = 20;
    const WINDOW_MS = 60 * 1e3;
    const INACTIVE_MS = 10 * 60 * 1e3;
    const RATE_KEY = env.KV_RATE_LIMIT_KEY;
    const ip = request.eo?.clientIp;
    if (!ip)
      return null;
    const records = await OSFAST_KV.get(RATE_KEY, { type: "json" }) || {};
    const now = Date.now();
    for (const [k, rec2] of Object.entries(records)) {
      if (now - rec2.lastRequest > INACTIVE_MS) {
        delete records[k];
      }
    }
    const rec = records[ip];
    if (rec) {
      if (now - rec.firstRequest < WINDOW_MS) {
        if (rec.count >= MAX_REQUESTS) {
          return new Response(JSON.stringify({ code: 4001, msg: "\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41" }), { status: 429 });
        }
        rec.count += 1;
      } else {
        rec.count = 1;
        rec.firstRequest = now;
      }
      rec.lastRequest = now;
    } else {
      records[ip] = { count: 1, firstRequest: now, lastRequest: now };
    }
    await OSFAST_KV.put(RATE_KEY, JSON.stringify(records), { expirationTtl: 60 });
    return null;
  }

  // edge-functions/api/version/list.ts
  function compareVersion(v1, v2) {
    const arr1 = v1.split(".").map(Number);
    const arr2 = v2.split(".").map(Number);
    for (let i = 0; i < 3; i++) {
      const num1 = arr1[i] || 0;
      const num2 = arr2[i] || 0;
      if (num1 > num2)
        return 1;
      if (num1 < num2)
        return -1;
    }
    return 0;
  }
  export async function onRequest({ request, params, env }) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400"
        }
      });
    }
    console.log("\u8FD9\u662Flist.ts", params);
    if (request.method !== "GET") {
      return new Response(JSON.stringify({ code: 1001, msg: "\u8BF7\u6C42\u9519\u8BEF" }), { status: 500 });
    }
    const checkEnvLimit = await CheckEnvLimit(request, params, env);
    if (checkEnvLimit instanceof Response) {
      return checkEnvLimit;
    }
    const checkRateLimit = await CheckRateLimit(request, params, env);
    if (checkRateLimit instanceof Response) {
      return checkRateLimit;
    }
    try {
      const origReqURL = new URL(request.url);
      const query = origReqURL.searchParams;
      const page = Math.max(1, parseInt(query.get("page") || "1"));
      const pageSize = Math.min(100, Math.max(1, parseInt(query.get("page_size") || "50")));
      let verType = query.get("type") || "IMG";
      verType = verType.toLocaleUpperCase();
      if (verType !== "OTA" && verType !== "IMG" && verType !== "BACKUP") {
        return new Response(JSON.stringify({ code: 1002, msg: "\u53C2\u6570\u9519\u8BEF" }), { status: 200 });
      }
      const api = `https://api.cnb.cool/${env.PYPI_REPO_SLUG}/-/packages/pypi/${verType}/-/tags?page=${page}&page_size=${pageSize}&ordering=last_push_at`;
      const response = await fetch(api, {
        headers: {
          "Accept": "application/vnd.cnb.api+json",
          "Authorization": `${env.CNB_PASSWORD}`
        }
      });
      if (!response.ok) {
        console.log(response.status);
        return new Response(JSON.stringify({ code: 1006, msg: `\u670D\u52A1\u4E0D\u53EF\u7528: ${response.status}` }), { status: 200 });
      }
      const tags_data = await response.json();
      const cnbPage = parseInt(response.headers.get("x-cnb-page") || page.toString());
      const cnbPageSize = parseInt(response.headers.get("x-cnb-page-size") || pageSize.toString());
      const cnbTotal = parseInt(response.headers.get("x-cnb-total") || "0");
      const totalPages = Math.ceil(cnbTotal / cnbPageSize);
      const sortedVersions = tags_data.pypi.sort((a, b) => compareVersion(b.name, a.name));
      const processedVersions = sortedVersions.map((version) => ({
        ...version,
        last_pusher: {
          ...version.last_pusher,
          push_at: new Date(version.last_pusher.push_at).getTime()
        }
      }));
      const result = {
        code: 0,
        data: {
          versions: processedVersions,
          total: cnbTotal,
          page: cnbPage,
          page_size: cnbPageSize,
          total_pages: totalPages
        }
      };
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ code: 1e3, msg: "\u670D\u52A1\u4E0D\u53EF\u7528" }), { status: 500 });
    }
  }
