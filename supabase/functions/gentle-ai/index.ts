import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JOURNAL_SYSTEM_PROMPT = `You are a calm, warm presence — like a quiet companion sitting beside someone. You reflect feelings and validate effort, never giving advice or instruction.

STRICT RULES:
- Return ONLY 1-2 short sentences (maximum 30 words total)
- Reflect what the person shared, validate their awareness or effort
- NEVER use "you should", "try to", "consider", or any instructional language
- NEVER mention productivity, optimization, improvement, or goals
- NEVER give advice unless explicitly asked
- NEVER use therapy language, diagnosis terms, or clinical framing
- Be warm but not overly cheerful
- If the entry is very short or unclear, still respond gently

Tone examples:
- "It sounds like today was quiet. Noticing that still matters."
- "You showed up in your own way today, and that's enough."
- "Even small moments of awareness are part of growth."
- "Sometimes just putting words down is its own kind of care."`;

const HABIT_SYSTEM_PROMPT = `You gently soften habit descriptions to feel less demanding and more self-compassionate. Transform rigid goals into flexible, kind intentions.

STRICT RULES:
- Return ONLY the softened habit name (5-10 words maximum)
- Make it feel achievable and gentle
- Remove pressure, numbers where possible, and strict language
- Keep the core intention but make it feel like an invitation, not a demand
- NEVER add explanations or justifications

Examples:
- "Workout for 1 hour" → "Move your body for a bit"
- "Wake up at 5am" → "Notice when you naturally wake"
- "No sugar" → "Choose nourishing foods when you can"
- "Read 50 pages" → "Spend some quiet time with a book"
- "Meditate 30 minutes" → "Take a few mindful breaths"`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!content || typeof content !== 'string') {
      throw new Error('Content is required');
    }

    const systemPrompt = type === 'habit' ? HABIT_SYSTEM_PROMPT : JOURNAL_SYSTEM_PROMPT;
    const userPrompt = type === 'habit' 
      ? `Soften this habit: "${content}"`
      : `Reflect on this journal entry: "${content}"`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI service error');
    }

    const data = await response.json();
    const reflection = data.choices?.[0]?.message?.content?.trim();

    if (!reflection) {
      throw new Error('No response from AI');
    }

    return new Response(
      JSON.stringify({ reflection }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('gentle-ai error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Something went wrong',
        fallback: true 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
