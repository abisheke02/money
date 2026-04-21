export interface Business {
  id: number
  name: string
  created_at: string
}

export interface Currency {
  code: string
  name: string
  symbol: string
  rate: number // Exchange rate relative to base currency (USD)
}

export interface Category {
  id: number
  name: string
  icon: string
  color: string
  type: 'credit' | 'debit' | 'both'
  created_at: string
}

export interface Transaction {
  id: number
  type: 'credit' | 'debit'
  amount: number
  category_id: number
  category?: Category
  business_id?: number
  currency: string // ISO 4217 currency code (e.g., 'USD', 'EUR')
  date: string
  due_date?: string
  reminder_days?: number
  note: string | null
  method: string | null
  tags: string | null
  created_at: string
  updated_at: string
}

export interface Settings {
  defaultCurrency: string
  updated_at: string
}

export interface DashboardSummary {
  totalBalance: number
  todayCredit: number
  todayDebit: number
  todayNet: number
  weekCredit: number
  weekDebit: number
  weekNet: number
  monthCredit: number
  monthDebit: number
  monthNet: number
}

export interface CategorySpend {
  categoryId: number
  categoryName: string
  categoryColor: string
  categoryIcon: string
  amount: number
  percentage: number
}

export interface DailyCashflow {
  date: string
  credit: number
  debit: number
}

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  type?: 'credit' | 'debit'
  categoryId?: number
  method?: string
  search?: string
  sortBy?: 'date' | 'amount'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface PaginatedTransactions {
  transactions: Transaction[]
  total: number
  page: number
  totalPages: number
}

export interface CurrencyResponse {
  currencies: Currency[]
  defaultCurrency: string
}

