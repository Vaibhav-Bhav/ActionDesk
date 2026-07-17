import { NextResponse } from "next/server";
import { getCards } from "@/lib/store";
import { buildIntelligenceContext } from "@/lib/intelligenceEngine";

/**
 * POST /api/morning-brief
 *
 * Generates a polished executive summary using Groq + live BI data.
 * Confidence score is derived from the shared intelligence engine (not ad-hoc).
 */
export async function POST() {
  try {
    const cards = getCards();
    const ctx   = buildIntelligenceContext(cards);

    const { biggestOpportunity, biggestRisk, revenue, metrics, priorities, confidence } = ctx;

    const dataBlock = [
      `Business Health: ${ctx.businessSnapshot.businessHealth.status} (${ctx.businessSnapshot.businessHealth.score}/100)`,
      `Potential Revenue: ${revenue.potentialRevenue}`,
      `Revenue at Risk: ${revenue.revenueAtRisk}`,
      `Pending Collection: ${revenue.pendingCollection}`,
      `Total Pending Actions: ${metrics.pendingActions}`,
      `Overdue Actions: ${metrics.overdueActions}`,
      `Active Companies: ${metrics.companies}`,
      ``,
      `Biggest Opportunity: ${biggestOpportunity.company} — ${biggestOpportunity.insight}`,
      `Estimated Revenue: ${biggestOpportunity.estimatedRevenue}`,
      `Recommended Action: ${biggestOpportunity.action}`,
      ``,
      `Biggest Risk: ${biggestRisk.company} — ${biggestRisk.insight}`,
      `Business Impact: ${biggestRisk.businessImpact}`,
      ``,
      `Top Priorities Today:`,
      ...priorities.slice(0, 3).map((p, i) => `  ${i + 1}. ${p.title} — ${p.reason}`),
    ].join("\n");

    const systemPrompt = `You are an executive business intelligence assistant for a small Indian furniture manufacturer.

Generate a single concise sentence (max 60 words) that gives the business owner one sharp, actionable takeaway for today.

RULES:
- One sentence only. No markdown. No filler. No "Based on the data".
- Professional tone. Reference actual names and amounts from the data.
- Focus on the most urgent thing that needs attention.`;

    const userPrompt = `Generate the executive takeaway using this live business data:\n\n${dataBlock}`;

    const apiKey = process.env.GROQ_API_KEY;
    const model  = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

    if (!apiKey) {
      return NextResponse.json({
        summary:    ctx.executiveSummary,
        confidence: confidence.score,
        present:    confidence.present,
        missing:    confidence.missing,
        isFallback: true,
      });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens:  120,
        stream:      false,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      throw new Error(`Groq error: ${err}`);
    }

    const groqData = await groqRes.json();
    const summary  = groqData.choices?.[0]?.message?.content?.trim() || ctx.executiveSummary;

    return NextResponse.json({
      summary,
      confidence: confidence.score,
      present:    confidence.present,
      missing:    confidence.missing,
      isFallback: false,
    });
  } catch (err) {
    const cards = getCards();
    const ctx   = buildIntelligenceContext(cards);
    return NextResponse.json({
      summary:    ctx.executiveSummary,
      confidence: ctx.confidence.score,
      present:    ctx.confidence.present,
      missing:    ctx.confidence.missing,
      isFallback: true,
      error:      err.message,
    });
  }
}
