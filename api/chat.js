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

        const systemPrompt = `Eres NAZBOT, el asistente inteligente de NAZBOT.
Tu objetivo es ayudar a los usuarios interesados en automatización e IA Generativa.
NAZBOT ofrece:
1. Automatización de procesos (n8n, flujos comerciales, CRM).
2. IA Generativa para Media (Media IA, Avatares, Contenido Visual).

Debes ser profesional, futurista y eficiente. 
IMPORTANTE: Si el usuario muestra interés real o pregunta por precios/contratación, debes pedirle amablemente su EMAIL o TELÉFONO para que David Masegosa pueda contactarle personalmente.
No inventes servicios. Mantente en el contexto de NAZBOT.`;

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
