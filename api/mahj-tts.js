// /api/mahj-tts.js

export default async function handler(req, res) {
  // --- CORS HEADERS ---
  // Allow your production site to call this API
  res.setHeader('Access-Control-Allow-Origin', 'https://askmahj.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight (OPTIONS) request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body || {};

  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }

  try {
    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/z7C1qgOMKZjTKUdAfEzs`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.8,
          },
        }),
      }
    );

    if (!elevenRes.ok) {
      const errText = await elevenRes.text();
      console.error('ElevenLabs error:', elevenRes.status, errText);
      return res.status(500).json({
        error: 'ElevenLabs request failed',
        status: elevenRes.status,
        details: errText,
      });
    }

    const audioBuffer = Buffer.from(await elevenRes.arrayBuffer());

    // Important: CORS + audio on final response
    res.setHeader('Access-Control-Allow-Origin', 'https://askmahj.com');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);

    return res.status(200).send(audioBuffer);
  } catch (e) {
    console.error('Proxy error:', e);
    return res.status(500).json({ error: 'Proxy error', details: e.message });
  }
}
