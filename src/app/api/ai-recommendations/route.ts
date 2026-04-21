import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  defaultHeaders: { 'anthropic-beta': 'prompt-caching-2024-07-31' },
})

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

Keep advice practical, specific to Indian markets, and based on the provided financial data.`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { income, expenses, balance, savingsRate, topCategories, currency } = body

    if (!income || expenses === undefined) {
      return NextResponse.json({ error: 'Missing required financial data' }, { status: 400 })
    }

    const userPrompt = `Here is my financial summary for analysis:

- Monthly Income: ${currency} ${income.toLocaleString()}
- Monthly Expenses: ${currency} ${expenses.toLocaleString()}
- Current Balance: ${currency} ${balance.toLocaleString()}
- Savings Rate: ${savingsRate.toFixed(1)}%
- Top Spending Categories: ${topCategories.map((c: any) => `${c.name} (${currency} ${c.amount})`).join(', ')}

Please provide personalized investment recommendations for Gold, SIP mutual funds, and Fixed Deposits based on my financial situation. Also suggest ways to reduce expenses and improve savings.`

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [{ role: 'user', content: userPrompt }]
    })

    const message = await stream.finalMessage()
    const content = message.content[0]

    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response')
    }

    const recommendations = JSON.parse(jsonMatch[0])
    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('AI recommendations error:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
