import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { history, prompt, settings, action, audio, mimeType } = await req.json()
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY')
    
    if (!geminiKey) throw new Error("GEMINI_API_KEY não configurada.")
    if (!deepseekKey && action !== 'transcribe') throw new Error("DEEPSEEK_API_KEY não configurada.")

    // --- LOGICA DE TRANSCRIÇÃO (MANTIDA NO GEMINI) ---
    if (action === 'transcribe') {
      const API_VERSION = "v1beta";
      const MODEL = "gemini-3-flash-preview";
      const BASE_URL = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL}`;
      
      const response = await fetch(`${BASE_URL}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { data: audio, mimeType: mimeType } },
              { text: "Transcreva o áudio jurídico a seguir. Remova vícios de linguagem e corrija o português. Retorne APENAS a transcrição corrigida e limpa, sem qualquer introdução, explicação, aspas ou prefácios." }
            ]
          }]
        })
      });
      const data = await response.json();
      return new Response(JSON.stringify({ text: data.candidates?.[0]?.content?.parts?.[0]?.text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- LOGICA DE CHAT ---
    
    // Verificar se há arquivos no prompt ou no histórico para decidir o modelo
    const hasFile = (Array.isArray(prompt) && prompt.some((p: any) => p.inlineData)) ||
                    (history.some((h: any) => h.parts.some((p: any) => p.inlineData)));

    if (hasFile) {
      // Fallback para Gemini para análise de arquivos (DeepSeek não suporta arquivos/visão)
      const API_VERSION = "v1beta";
      const MODEL = "gemini-3-flash-preview";
      const BASE_URL = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL}`;

      const promptParts = Array.isArray(prompt) ? prompt : [{ text: prompt }];

      const response = await fetch(`${BASE_URL}:streamGenerateContent?alt=sse&key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: settings?.systemInstruction }] },
          contents: [...history, { role: 'user', parts: promptParts }],
          generationConfig: {
            temperature: 1.0,
            topP: 0.95,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `Erro Gemini API: ${response.status}`);
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' }
      });
    }

    // --- DEEPSEEK V4-FLASH (PARA CHAT DE TEXTO PURO) ---
    const messages = [];
    if (settings?.systemInstruction) {
      messages.push({ role: "system", content: settings.systemInstruction });
    }

    for (const entry of history) {
      const role = entry.role === 'model' ? 'assistant' : 'user';
      const content = entry.parts.map((p: any) => p.text || "").join("\n");
      messages.push({ role, content });
    }

    const userContent = Array.isArray(prompt)
      ? prompt.map((p: any) => p.text || "").join("\n")
      : prompt;
      
    messages.push({ role: "user", content: userContent });

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `Erro DeepSeek API: ${response.status}`);
    }

    // Repassa o stream para o frontend
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' }
    });

  } catch (error) {
    console.error(`[gemini-chat] Erro: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})