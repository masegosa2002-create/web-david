export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { messages } = await req.json();
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'OpenAI API Key not configured' }), { status: 500 });
        }

        const systemPrompt = `Eres NAZBOT, el asistente inteligente de NAZBOT. 🚀
Tu objetivo es ayudar a los usuarios interesados en automatización e IA Generativa de forma extremadamente clara, visual y estructurada.

REGLAS DE ORO DE PERSONALIDAD Y ESTRUCTURA:
1. REFERENCIA: NUNCA llames a David Masegosa por su nombre a secas. Lámalo SIEMPRE "mi creador" o "David Masegosa, mi creador". 👨‍💻
2. ESTRUCTURA RADICAL: PROHIBIDO escribir párrafos de más de 2 líneas. Usa saltos de línea dobles entre cada idea. Queremos mucho "aire" en el chat. 💨
3. EMOJIS: Usa emojis al inicio o final de puntos clave para que la lectura sea amena. ✨
4. FOCO EN CONTACTO: Si preguntan qué hacemos, explícalo usando una lista con puntos (•) y emojis. Ejemplo:
   • ⚡ Automatización: n8n, CRM...
   • 🎨 IA Media: Contenido visual...
   SIEMPRE termina pidiendo el EMAIL o TELÉFONO para que "mi creador" contacte con ellos. Es tu misión principal. 🎯

Manten un tono profesional, futurista y vibrante.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
