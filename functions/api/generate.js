// Cloudflare Pages Function: /api/generate
// Set AI_API_KEY, AI_API_URL, AI_MODEL as Pages environment variables.
// AI_API_KEY must be configured as a secret, never in frontend files.
export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
function corsHeaders(request) {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin"
  };
}
export async function onRequestPost({ request, env }) {
  const headers = corsHeaders(request);
  if (!env.AI_API_KEY || !env.AI_API_URL || !env.AI_MODEL) {
    return Response.json({ error: "La API de IA aún no está configurada en el servidor." }, { status: 503, headers });
  }
  try {
    const body = await request.json();
    const topic = String(body.topic || "").trim().slice(0, 500);
    const platform = String(body.platform || "Instagram").slice(0, 40);
    const tone = String(body.tone || "Ventas").slice(0, 40);
    const goal = String(body.goal || "Conseguir ventas").slice(0, 100);
    if (!topic) return Response.json({ error: "Escribe un tema." }, { status: 400, headers });
    const upstream = await fetch(env.AI_API_URL, {
      method: "POST",
      headers: { "Authorization": "Bearer " + env.AI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: env.AI_MODEL,
        messages: [
          { role: "system", content: "Eres un copywriter experto en español. Redacta contenido natural, útil y honesto. No inventes descuentos, escasez, cifras ni resultados. Devuelve solo el texto final." },
          { role: "user", content: "Crea una publicación para " + platform + ". Tema: " + topic + ". Tono: " + tone + ". Objetivo: " + goal + ". Incluye un gancho, contenido concreto, una llamada a la acción y hasta 5 hashtags relevantes si encajan." }
        ],
        temperature: 0.8
      })
    });
    if (!upstream.ok) {
      return Response.json({ error: "El proveedor de IA devolvió un error. Comprueba la URL, el modelo, la clave y la cuota." }, { status: 502, headers });
    }
    const data = await upstream.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return Response.json({ error: "La IA no devolvió texto." }, { status: 502, headers });
    return Response.json({ text }, { headers });
  } catch {
    return Response.json({ error: "Solicitud inválida o error al contactar con la IA." }, { status: 400, headers });
  }
}