export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return new Response("Use POST", { status: 405 });
    }

    const { text, voiceId } = await req.json();
    if (!text) {
      return new Response("Missing 'text'", { status: 400 });
    }

    const VOICE = voiceId || process.env.ELEVEN_VOICE_ID;

    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVEN_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.8,
            style: 0.4
          }
        })
      }
    );

    if (!r.ok) {
      const err = await r.text();
      return new Response(err || "TTS error", { status: r.status });
    }

    const audio = await r.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: { "Content-Type": "audio/mpeg" }
    });
  } catch (e) {
    return new Response("Proxy error", { status: 500 });
  }
}
