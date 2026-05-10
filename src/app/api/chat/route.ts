import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not configured. Add it to .env.local.' },
      { status: 500 }
    )
  }

  let rawMessages: { role: string; content: string }[]

  try {
    const body = await request.json()
    rawMessages = body.messages
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return Response.json({ error: 'messages array is required' }, { status: 400 })
  }

  const messages = rawMessages.filter(
    (m) => m.role === 'user' || m.role === 'assistant'
  )

  console.log("Sending messages:", JSON.stringify(messages, null, 2));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: `You are the research agent for AmericanPeptide.com, an AI-powered peptide drug discovery platform. You help researchers with:
- Peptide compound information (also available at /compounds via PubChem search)
- Clinical trial intelligence (also available at /trials via ClinicalTrials.gov)
- Literature review and evidence synthesis
- Peptide sequence analysis and design concepts
- Melanocortin receptor agonist research (setmelanotide, bremelanotide, afamelanotide and emerging candidates)

When users ask about specific compounds, suggest they also try the Compound Search tool. When they ask about trials, suggest the Clinical Trials dashboard. Be scientifically precise. Note that all outputs are computational research aids, not clinical recommendations.`,
      messages: messages
    })
  });

  const rawText = await response.text();
  console.log("Status:", response.status, "Body:", rawText);

  if (!response.ok) {
    return Response.json({ error: rawText }, { status: response.status });
  }

  const data = JSON.parse(rawText);
  console.log("Full API response:", JSON.stringify(data, null, 2));
  const assistantMessage = data.content?.[0]?.text || "No response generated";
  return Response.json({ role: "assistant", content: assistantMessage });
}
