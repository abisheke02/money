import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { income, expenses, balance, savingsRate, topCategories, currency } = body

    if (!income || expenses === undefined) {
      return NextResponse.json({ error: 'Missing required financial data' }, { status: 400 })
    }

    const prompt = `You are a personal finance advisor for Indian markets.
Analyze this financial data and respond with ONLY a valid JSON object:

{
  "savings": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "investments": {
    "gold": "gold advice with amounts",
    "sip": "SIP/mutual fund advice",
    "fd": "FD advice with rates"
  },
  "summary": "2-3 sentence assessment",
  "riskProfile": "conservative",
  "monthlyInvestmentCapacity": 5000
}

Financial data:
- Monthly Income: ${currency} ${income.toLocaleString()}
- Monthly Expenses: ${currency} ${expenses.toLocaleString()}
- Current Balance: ${currency} ${balance.toLocaleString()}
- Savings Rate: ${savingsRate.toFixed(1)}%

Respond with ONLY the JSON, no markdown, no extra text.`

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Gemini API error:', res.status, errText)
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Could not parse JSON from response')

    const recommendations = JSON.parse(jsonMatch[0])
    return NextResponse.json(recommendations)
  } catch (error: any) {
    console.error('AI recommendations error:', error?.message || error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
