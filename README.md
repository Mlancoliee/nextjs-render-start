// cookie ❌
// set-cookie ✅ -> via header
// request header -> read only ❌
// reponse header -> Header ✅
// rewrite ❌
// redirect -> Response.redirect ✅ -> if url -> url?
// next ❌
// response ✅
response.setCookie ? -> new Cookies ? cookies.get?