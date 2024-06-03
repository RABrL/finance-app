'use client'

import { Suspense, lazy, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import type { transactions as transactionSchema } from '@/db/schema'

import { useNewTransaction } from '@/features/transactions/hooks/use-new-transaction'
import { useGetTransactions } from '@/features/transactions/api/use-get-transactions'
import { useBulkDeleteTransactions } from '@/features/transactions/api/use-bulk-delete-transactions'
import { useBulkCreateTransactions } from '@/features/transactions/api/use-bulk-create-transactions copy'

import { useSelectAccount } from '@/features/accounts/hooks/use-select-account'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { TableLoading } from '@/components/table-loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { columns } from './columns'
import { UploadButton } from './upload-buton'
const ImportCard = lazy(() =>
  import('./import-card').then((mod) => ({ default: mod.ImportCard }))
)

enum VARIANTS {
  LIST = 'LIST',
  IMPORT = 'IMPORT'
}

const INITIAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: {}
}

const TransactionsPage = () => {
  const [AccountDialog, confirm] = useSelectAccount()
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST)
  const [importResuts, setImportResults] = useState(INITIAL_IMPORT_RESULTS)

  const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
    setImportResults(results)
    setVariant(VARIANTS.IMPORT)
  }

  const onCancelImport = () => {
    setImportResults(INITIAL_IMPORT_RESULTS)
    setVariant(VARIANTS.LIST)
  }

  const { onOpen } = useNewTransaction()
  const createTransactions = useBulkCreateTransactions()
  const transactionsQuery = useGetTransactions()
  const deleteTransactionsQuery = useBulkDeleteTransactions()
  const transactions = transactionsQuery.data || []

  const isDisabled =
    transactionsQuery.isLoading || deleteTransactionsQuery.isPending

  const onSubmitImport = async (
    value: (typeof transactionSchema.$inferInsert)[]
  ) => {
    const accountId = await confirm()
    if (!accountId) return toast.error('Please select an account to continue')

    const data = value.map((transaction) => ({
      ...transaction,
      accountId: accountId as string
    }))

    createTransactions.mutate(data, {
      onSuccess: () => {
        toast.success('Transactions imported successfully')
        onCancelImport()
      },
      onError: () => {
        toast.error('Failed to import transactions')
      }
    })
  }

  if (variant === VARIANTS.IMPORT) {
    return (
      <>
        <AccountDialog />
        <Suspense
          fallback={
            <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
              <Card className="border-none drop-shadow-sm">
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="text-xl line-clamp-1">
                    Import Transaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px] w-full flex items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-slate-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          }
        >
          <ImportCard
            data={importResuts.data}
            onCancel={onCancelImport}
            onSubmit={onSubmitImport}
          />
        </Suspense>
      </>
    )
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Transaction History
          </CardTitle>
          <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
            <Button onClick={onOpen} size="sm" className="w-full lg:w-auto">
              <Plus className="size-4 mr-2" />
              Add New
            </Button>
            <UploadButton onUpload={onUpload} />
          </div>
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
