'use client'

import { Plus } from 'lucide-react'

import { useNewAccount } from '@/features/accounts/hooks/use-new-account'
import { useGetAccounts } from '@/features/accounts/api/use-get-accounts'
import { useBulkDeleteAccunts } from '@/features/accounts/api/use-bulk-delete-accounts'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { TableLoading } from '@/components/table-loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { columns } from './columns'

const AccountsPage = () => {
  const { onOpen } = useNewAccount()
  const accountsQuery = useGetAccounts()
  const deleteAccountsQuery = useBulkDeleteAccunts()
  const accounts = accountsQuery.data || []

  const isDisabled = accountsQuery.isLoading || deleteAccountsQuery.isPending

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">Accounts</CardTitle>
          <Button onClick={onOpen} size="sm">
            <Plus className="size-4 mr-2" />
            Add New
          </Button>
        </CardHeader>
        <CardContent>
          {accountsQuery.isLoading ? (
            <TableLoading />
          ) : (
            <DataTable
              columns={columns}
              data={accounts}
              filterKey="name"
              onDelete={(rows) => {
                const ids = rows.map((row) => row.original.id)
                deleteAccountsQuery.mutate({ ids })
              }}
              disabled={isDisabled}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AccountsPage
