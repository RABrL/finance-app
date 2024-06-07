'use client'

import { useSearchParams } from 'next/navigation'
import { FaPiggyBank } from 'react-icons/fa'
import { FaArrowTrendDown, FaArrowTrendUp } from 'react-icons/fa6'

import { useGetSummary } from '@/features/summary/api/use-get-summary'

import { formatDataRange } from '@/lib/utils'

import { DataCard, DataCardLoading } from '@/components/data-card'

export const DataGrid = () => {
  const { data, isLoading } = useGetSummary()

  const params = useSearchParams()
  const to = params.get('to') || undefined
  const from = params.get('from') || undefined

  const dateRangelabel = formatDataRange({ from, to })

  if (isLoading)
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
        <DataCardLoading
          title="Remaining"
          icon={FaPiggyBank}
          dateRange={dateRangelabel}
        />
        <DataCardLoading
          title="Income"
          icon={FaArrowTrendUp}
          dateRange={dateRangelabel}
          variant="success"
        />
        <DataCardLoading
          title="Expenses"
          icon={FaArrowTrendDown}
          dateRange={dateRangelabel}
          variant="danger"
        />
      </div>
    )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
      <DataCard
        title="Remaining"
        value={data?.remainingAmount}
        percentageChange={data?.remainingChange}
        icon={FaPiggyBank}
        dateRange={dateRangelabel}
      />
      <DataCard
        title="Income"
        value={data?.incomeAmount}
        percentageChange={data?.incomeChange}
        icon={FaArrowTrendUp}
        variant="success"
        dateRange={dateRangelabel}
      />
      <DataCard
        title="Expenses"
        value={data?.expensesAmount}
        percentageChange={data?.expensesChange}
        icon={FaArrowTrendDown}
        variant="danger"
        dateRange={dateRangelabel}
      />
    </div>
  )
}
