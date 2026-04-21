'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Business } from '@/types'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'

interface BusinessContextType {
  activeBusiness: Business | null
  businesses: Business[]
  setActiveBusinessId: (id: number) => void
  refreshBusinesses: () => Promise<void>
  loading: boolean
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedId, setSavedId] = useLocalStorage<number | null>('active_business_id', null)

  const refreshBusinesses = useCallback(async () => {
    try {
      const res = await fetch('/api/businesses')
      if (!res.ok) throw new Error('Failed to fetch businesses')
      const data: Business[] = await res.json()
      if (!Array.isArray(data)) throw new Error('Invalid businesses data')
      setBusinesses(data)

      const found = savedId ? data.find(b => b.id === savedId) : null
      const active = found ?? data[0] ?? null
      setActiveBusiness(active)
      if (active && active.id !== savedId) setSavedId(active.id)
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
    } finally {
      setLoading(false)
    }
  }, [savedId, setSavedId])

  useEffect(() => { refreshBusinesses() }, [refreshBusinesses])

  const setActiveBusinessId = (id: number) => {
    const found = businesses.find(b => b.id === id)
    if (found) { setActiveBusiness(found); setSavedId(id) }
  }

  return (
    <BusinessContext.Provider value={{ activeBusiness, businesses, setActiveBusinessId, refreshBusinesses, loading }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (context === undefined) throw new Error('useBusiness must be used within a BusinessProvider')
  return context
}
