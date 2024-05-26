'use client'

import { Plus } from 'lucide-react'

import { useNewTransaction } from '@/features/transactions/hooks/use-new-transaction'
import { useGetTransactions } from '@/features/transactions/api/use-get-transactions'
import { useBulkDeleteTransactions } from '@/features/transactions/api/use-bulk-delete-transactions'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { TableLoading } from '@/components/table-loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { columns } from './columns'

const TransactionsPage = () => {
  const { onOpen } = useNewTransaction()
  const transactionsQuery = useGetTransactions()
  const deleteTransactionsQuery = useBulkDeleteTransactions()
  const transactions = transactionsQuery.data || []

  const isDisabled = transactionsQuery.isLoading || deleteTransactionsQuery.isPending

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">Transaction History</CardTitle>
          <Button onClick={onOpen} size="sm">
            <Plus className="size-4 mr-2" />
            Add New
          </Button>
        </CardHeader>
        <CardContent>
          {transactionsQuery.isLoading ? (
            <TableLoading />
          ) : (
            <DataTable
              columns={columns}
              data={transactions}
              filterKey="payee"
              onDelete={(rows) => {
                const ids = rows.map((row) => row.original.id)
                deleteTransactionsQuery.mutate({ ids })
              }}
              disabled={isDisabled}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TransactionsPage
