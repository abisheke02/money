import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const SYSTEM_PROMPT = `You are a personal finance advisor specializing in Indian investment markets.
Analyze the user's financial data and provide actionable recommendations.

Always respond with valid JSON in exactly this structure:
{
  "savings": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "investments": {
    "gold": "specific gold investment advice with amounts and expected returns",
    "sip": "specific SIP/mutual fund advice with fund types and monthly amounts",
    "fd": "specific FD advice with bank options and expected rates"
  },
  "summary": "2-3 sentence overall financial health assessment",
  "riskProfile": "conservative|moderate|aggressive",
  "monthlyInvestmentCapacity": number
}

Keep advice practical, specific to Indian markets, and based on the provided financial data.
Respond with ONLY the JSON object, no extra text.`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { income, expenses, balance, savingsRate, topCategories, currency } = body

    if (!income || expenses === undefined) {
      return NextResponse.json({ error: 'Missing required financial data' }, { status: 400 })
    }

    const userPrompt = `${SYSTEM_PROMPT}

Here is my financial summary:
- Monthly Income: ${currency} ${income.toLocaleString()}
- Monthly Expenses: ${currency} ${expenses.toLocaleString()}
- Current Balance: ${currency} ${balance.toLocaleString()}
- Savings Rate: ${savingsRate.toFixed(1)}%
- Top Spending Categories: ${topCategories?.map((c: any) => `${c.name} (${currency} ${c.amount})`).join(', ') || 'N/A'}

Provide personalized investment recommendations for Gold, SIP mutual funds, and Fixed Deposits. Also suggest ways to reduce expenses and improve savings.`

    // Use v1 API version to access gemini-1.5-flash
    const model = genAI.getGenerativeModel(
      { model: 'gemini-1.5-flash' },
      { apiVersion: 'v1' }
    )

    const result = await model.generateContent(userPrompt)
    const text = result.response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Could not parse JSON from response')

    const recommendations = JSON.parse(jsonMatch[0])
    return NextResponse.json(recommendations)
  } catch (error: any) {
    console.error('AI recommendations error:', error?.message || error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
