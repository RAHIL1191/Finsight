// app/api/auth/mobile/start/route.ts
// Self-contained entry point for mobile OAuth.
// Serves a minimal HTML page that fetches the CSRF token and
// auto-submits the NextAuth Google sign-in form.
// No React hydration, no external CSS — works reliably in embedded browsers.

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const callbackUrl = url.searchParams.get("callbackUrl")
        || `${url.origin}/api/auth/mobile`;

    const origin = url.origin;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>FinSight — Signing In</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0F0F14;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui,-apple-system,sans-serif;flex-direction:column}
.spinner{width:40px;height:40px;border:3px solid #2A2A38;border-top:3px solid #6C63FF;border-radius:50%;animation:spin .8s linear infinite;margin-bottom:20px}
p{color:#8888AA;font-size:16px}
.error{color:#EF4444;display:none}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div class="spinner" id="sp"></div>
<p id="msg">Connecting to Google…</p>
<p class="error" id="err">Something went wrong. Please close and try again.</p>
<form id="f" method="POST" action="${origin}/api/auth/signin/google">
  <input type="hidden" name="callbackUrl" value="${callbackUrl}"/>
  <input type="hidden" name="csrfToken" id="csrf"/>
</form>
<script>
fetch("${origin}/api/auth/csrf",{credentials:"include"})
  .then(function(r){return r.json()})
  .then(function(d){
    document.getElementById("csrf").value=d.csrfToken;
    document.getElementById("f").submit();
  })
  .catch(function(){
    document.getElementById("sp").style.display="none";
    document.getElementById("msg").style.display="none";
    document.getElementById("err").style.display="block";
  });
</script>
</body>
</html>`;

    return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}
