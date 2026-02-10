import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js"

const GCLOUD_PROJECT = Deno.env.get("GCLOUD_PROJECT")!
const GCLOUD_REGION = Deno.env.get("GCLOUD_REGION") ?? "us-central1"
const SERVICE_ACCOUNT_KEY = JSON.parse(
  Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY")!,
)

/** Build a signed JWT and exchange it for an access token. */
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: "RS256", typ: "JWT" }
  const payload = {
    iss: SERVICE_ACCOUNT_KEY.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }

  const enc = (obj: unknown) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")

  const unsignedToken = `${enc(header)}.${enc(payload)}`

  // Import the RSA private key
  const pemContents = SERVICE_ACCOUNT_KEY.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "")

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0))
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  )

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken),
  )

  const signedToken = `${unsignedToken}.${btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")}`

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedToken,
    }),
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`)
  }

  return tokenData.access_token as string
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    })
  }

  try {
    // Authenticate the request via Supabase JWT
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { audio_base64, mime_type, system_prompt, structure } =
      await req.json()

    if (!audio_base64 || !mime_type || !system_prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    const accessToken = await getAccessToken()

    const endpoint = `https://${GCLOUD_REGION}-aiplatform.googleapis.com/v1/projects/${GCLOUD_PROJECT}/locations/${GCLOUD_REGION}/publishers/google/models/gemini-2.5-flash:generateContent`

    // Build the Gemini request
    const geminiRequest: Record<string, unknown> = {
      contents: [
        {
          role: "user",
          parts: [
            {
              inline_data: {
                mime_type,
                data: audio_base64,
              },
            },
            {
              text: "Process this audio recording according to your instructions.",
            },
          ],
        },
      ],
      system_instruction: {
        parts: [{ text: system_prompt }],
      },
      generation_config: {
        response_mime_type: "application/json",
      } as Record<string, unknown>,
    }

    if (structure) {
      ;(geminiRequest.generation_config as Record<string, unknown>).response_schema = structure
    }

    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(geminiRequest),
    })

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text()
      console.error("Gemini API error:", errBody)
      return new Response(
        JSON.stringify({ error: "Gemini API request failed", details: errBody }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      )
    }

    const geminiData = await geminiRes.json()
    const textContent =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""

    // Parse the JSON response from Gemini
    const parsed = JSON.parse(textContent)

    return new Response(JSON.stringify(parsed), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err) {
    console.error("Edge function error:", err)
    return new Response(
      JSON.stringify({
        error: "Internal error",
        message: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    )
  }
})
