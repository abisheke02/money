'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Currency } from '@/types'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'

interface CurrencyContextType {
  currentCurrency: string
  currencies: Currency[]
  setCurrentCurrency: (code: string) => Promise<void>
  refreshCurrencies: () => Promise<void>
  loading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [currentCurrency, setCurrentCurrencyState] = useState<string>('USD')
  const [loading, setLoading] = useState(true)
  const [savedCode, setSavedCode] = useLocalStorage<string>('active_currency', 'USD')

  const refreshCurrencies = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/currencies')
      if (!res.ok) throw new Error('Failed to fetch currencies')
      const data = await res.json()
      const list: Currency[] = data.currencies || []
      setCurrencies(list)
      const valid = list.find(c => c.code === savedCode) ? savedCode : (data.defaultCurrency || 'USD')
      setCurrentCurrencyState(valid)
      if (valid !== savedCode) setSavedCode(valid)
    } catch (error) {
      console.error('Failed to fetch currencies:', error)
    } finally {
      setLoading(false)
    }
  }, [savedCode, setSavedCode])

  useEffect(() => { refreshCurrencies() }, [refreshCurrencies])

  const setCurrentCurrency = async (code: string) => {
    const found = currencies.find(c => c.code === code)
    if (!found) return
    setCurrentCurrencyState(code)
    setSavedCode(code)
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultCurrency: code }),
    })
  }

  return (
    <CurrencyContext.Provider value={{ currentCurrency, currencies, setCurrentCurrency, refreshCurrencies, loading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) throw new Error('useCurrency must be used within a CurrencyProvider')
  return context
}
