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

  // edge-functions/api/version/[version].ts
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
  function getUrlByFilename(html, filename) {
    const regex = new RegExp(`<a\\s+[^>]*href=["']([^"']+)["'][^>]*>\\s*${filename}\\s*</a>`, "i");
    const match = html.match(regex);
    return match ? match[1] : null;
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
    console.log("\u8FD9\u662F[version].ts", params);
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
      if (!params || !("version" in params)) {
        return new Response(JSON.stringify({ code: 1004, msg: "\u8DEF\u7531\u9519\u8BEF" }), { status: 200 });
      }
      let version = "";
      if (typeof params.version === "string") {
        version = params.version;
      } else if (Array.isArray(params.version)) {
        version = params.version[0];
      }
      if (version === "") {
        return new Response(JSON.stringify({ code: 1005, msg: "\u8DEF\u7531\u9519\u8BEF" }), { status: 200 });
      }
      if (version === "latest") {
        const api2 = `https://api.cnb.cool/${env.PYPI_REPO_SLUG}/-/packages/pypi/${env.PYPI_PACKAGE_NAME}/-/tags?page=1&page_size=50&ordering=last_push_at`;
        const response2 = await fetch(api2, {
          headers: {
            "Accept": "application/vnd.cnb.api+json",
            "Authorization": `${env.CNB_PASSWORD}`
          }
        });
        if (!response2.ok) {
          console.log(response2.status);
          return new Response(JSON.stringify({ code: 1006, msg: `\u670D\u52A1\u4E0D\u53EF\u7528: ${response2.status}` }), { status: 200 });
        }
        const tags_data = await response2.json();
        const latestVersion = tags_data.pypi.reduce((prev, curr) => {
          return compareVersion(curr.name, prev.name) > 0 ? curr : prev;
        });
        version = latestVersion.name;
      }
      let api = `https://api.cnb.cool/${env.PYPI_REPO_SLUG}/-/packages/pypi/${env.PYPI_PACKAGE_NAME}/-/tag/${version}`;
      let response = await fetch(api, {
        headers: {
          "Accept": "application/vnd.cnb.api+json",
          "Authorization": `${env.CNB_PASSWORD}`
        }
      });
      if (!response.ok) {
        console.log(response.status);
        return new Response(JSON.stringify({ code: 1007, msg: `\u670D\u52A1\u4E0D\u53EF\u7528: ${response.status}` }), { status: 200 });
      }
      const tag_data = await response.json();
      api = `https://pypi.cnb.cool/${env.PYPI_REPO_SLUG}/-/packages/simple/${env.PYPI_PACKAGE_NAME}`;
      response = await fetch(api, {
        headers: {
          "Accept": "application/vnd.cnb.api+json",
          "Authorization": `Basic ${btoa(env.CNB_USERNAME + ":" + env.CNB_PASSWORD)}`
        }
      });
      if (!response.ok) {
        console.log(response.status, api);
        return new Response(JSON.stringify({ code: 1008, msg: `\u670D\u52A1\u4E0D\u53EF\u7528: ${response.status}` }), { status: 200 });
      }
      const html_data = await response.text();
      if (html_data === "" || html_data === null || html_data.startsWith("error") || !html_data.includes("<!DOCTYPE html>")) {
        return new Response(JSON.stringify({ code: 1009, msg: `\u670D\u52A1\u4E0D\u53EF\u7528: ${response.status}` }), { status: 200 });
      }
      const push_at = new Date(tag_data.pypi.last_pusher.push_at).getTime();
      const res = {
        version,
        push_at,
        files: tag_data.pypi.files,
        readme: tag_data.pypi.metadata.readme
      };
      for (let i = 0; i < res.files.length; i++) {
        let url = getUrlByFilename(html_data, res.files[i].name) || "";
        if (url === "") {
          res.files[i].url = "";
          continue;
        }
        if (url.startsWith("../../")) {
          url = url.replace("../../", "/");
        }
        if (url.indexOf("//") >= 0) {
          url = url.replace("//", "/");
        }
        if (!url.startsWith("/")) {
          url = "/" + url;
        }
        const [pathPart, hashPart] = url.split("#");
        const pathSegments = pathPart.split("/");
        const filename = pathSegments[pathSegments.length - 1];
        let ext = "";
        if (filename.endsWith(".tar.gz"))
          ext = "tar.gz";
        else if (filename.endsWith(".tar.xz"))
          ext = "tar.xz";
        else if (filename.endsWith(".tar.bz2"))
          ext = "tar.bz2";
        else {
          const match = filename.match(/\.([^.]+)$/);
          ext = match ? match[1] : "";
        }
        let sha256 = "";
        if (hashPart) {
          const match = hashPart.match(/sha256=([a-fA-F0-9]+)/);
          if (match)
            sha256 = match[1];
        }
        res.files[i].url = `/file/${btoa(pathPart)}/${res.files[i].name}`;
        res.files[i].ext = ext;
        res.files[i].sha256 = sha256;
      }
      const result = {
        code: 0,
        data: res
      };
      return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ code: 1e3, msg: "\u670D\u52A1\u4E0D\u53EF\u7528" }), { status: 500 });
    }
  }