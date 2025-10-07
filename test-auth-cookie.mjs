// test-auth-cookie.js
import fetch from "node-fetch";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function testAuth() {
  console.log(`🔎 Probando login en ${BASE_URL}`);

  const res = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      csrfToken: "dummy",
      email: "TU_EMAIL_DE_PRUEBA",
      password: "TU_PASSWORD_DE_PRUEBA",
    }),
    redirect: "manual",
  });

  console.log("📡 Status:", res.status);

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    console.log("✅ Set-Cookie detectado:");
    console.log(setCookie);
  } else {
    console.log("❌ No se envió ninguna cookie en la respuesta.");
  }

  const body = await res.text();
  console.log("🔍 Respuesta del servidor:\n", body);
}

testAuth().catch((e) => {
  console.error("💥 Error ejecutando prueba:", e);
  process.exit(1);
});
