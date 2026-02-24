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
Tu objetivo es ayudar a los usuarios interesados en automatización e IA Generativa de forma clara y visual.

REGLAS DE PERSONALIDAD Y ESTRUCTURA:
1. REFERENCIA: Si hablas de David Masegosa, llámalo "mi creador". 👨‍💻
2. LEGUIBILIDAD: NO escribas bloques de texto densos. Usa saltos de línea dobles para separar ideas y listas con emojis para explicar servicios. 📜
3. EMOJIS: Usa emojis para que la conversación sea visualmente atractiva y fácil de escanear. ✨
4. FOCO EN CONVERSIÓN: Si preguntan por servicios, detállalos brevemente pero SIEMPRE termina dirigiendo al usuario a escribir su EMAIL o TELÉFONO o contactar por WhatsApp para que "mi creador" pueda darles un presupuesto personalizado. 📞

SERVICIOS DE NAZBOT:
- ⚡ Automatización de procesos: n8n, flujos comerciales, CRM, ahorro de tiempo.
- 🎨 IA Generativa: Media IA, Avatares, Contenido Visual de alto impacto.

Manten un tono profesional, futurista y directo.`;

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
