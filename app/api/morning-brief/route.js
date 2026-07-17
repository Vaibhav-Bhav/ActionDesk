import { NextResponse } from "next/server";
import { getCards } from "@/lib/store";
import { generateBusinessIntelligence } from "@/lib/businessIntelligence";

/**
 * POST /api/morning-brief
 *
 * Uses Groq to generate a polished executive summary from live BI data.
 * Keeps the prompt lean — BI engine does the heavy lifting, Groq polishes prose.
 */
export async function POST() {
  try {
    const cards = getCards();
    const bi = generateBusinessIntelligence(cards);

    const { biggestOpportunity, biggestRisk, revenue, metrics, priorities } = bi;

    // Build a compact data block for the prompt
    const dataBlock = [
      `Business Health: ${bi.businessSnapshot.businessHealth.status} (${bi.businessSnapshot.businessHealth.score}/100)`,
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

Generate a single-paragraph executive morning brief that summarises the business situation.

RULES:
- Maximum 110 words. No markdown. No bullet points. Single paragraph of flowing prose.
- Professional executive tone — like a CFO briefing a business owner.
- Mention: overall business health, biggest opportunity, biggest risk, and 1-2 top priorities.
- Be specific — reference actual company names, amounts, and actions from the data.
- Do NOT use phrases like "Based on the data" or "According to the analysis".
- Start directly with the business situation. No filler opening.`;

    const userPrompt = `Generate the executive morning brief using this live business data:\n\n${dataBlock}`;

    // Confidence is computed from data richness
    const confidence = Math.min(
      100,
      Math.round(
        60 +
          Math.min(metrics.totalActions * 3, 20) +
          (metrics.overdueActions === 0 ? 10 : 0) +
          (priorities.length >= 3 ? 10 : 0)
      )
    );

    const apiKey = process.env.GROQ_API_KEY;
    const model  = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

    if (!apiKey) {
      // Graceful fallback — return the BI-computed summary without Groq polish
      return NextResponse.json({
        summary:    bi.executiveSummary,
        confidence,
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
        temperature:  0.5,
        max_tokens:   200,
        stream:       false,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      throw new Error(`Groq error: ${err}`);
    }

    const groqData = await groqRes.json();
    const summary  = groqData.choices?.[0]?.message?.content?.trim() || bi.executiveSummary;

    return NextResponse.json({ summary, confidence, isFallback: false });
  } catch (err) {
    // Always return something usable
    const cards = getCards();
    const bi    = generateBusinessIntelligence(cards);
    return NextResponse.json({
      summary:    bi.executiveSummary,
      confidence: 70,
      isFallback: true,
      error:      err.message,
    });
  }
}
