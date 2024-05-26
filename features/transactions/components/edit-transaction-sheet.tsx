import type { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { useGetAccounts } from '@/features/accounts/api/use-get-accounts'
import { useCreateAccount } from '@/features/accounts/api/use-create-account'

import { useGetCategories } from '@/features/categories/api/use-get-categories'
import { useCreateCategory } from '@/features/categories/api/use-create-category'

import { useGetTransaction } from '@/features/transactions/api/use-get-transaction'
import { useEditTransaction } from '@/features/transactions/api/use-edit-transaction'
import { useDeleteTransaction } from '@/features/transactions/api/use-delete-transaction'
import { TransactionForm } from '@/features/transactions/components/transaction-form'
import { useOpenTransaction } from '@/features/transactions/hooks/use-open-transaction'

import { useConfirm } from '@/hooks/use-confirm'

import { insertTransactionSchema } from '@/db/schema'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'

const formSchema = insertTransactionSchema.omit({
  id: true
})

type FormValues = z.infer<typeof formSchema>

export const EditTransactionSheet = () => {
  const { isOpen, onClose, id } = useOpenTransaction()

  const [ConfirmDialg, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this transaction.'
  )

  const transactionQuery = useGetTransaction(id)
  const editMutation = useEditTransaction(id)
  const deleteMutation = useDeleteTransaction(id)

  const categoryQuery = useGetCategories()
  const categoryMutation = useCreateCategory()
  const onCreateCategory = (name: string) => categoryMutation.mutate({ name })
  const categoryOptions = (categoryQuery.data ?? []).map((category) => ({
    label: category.name,
    value: category.id
  }))

  const accountQuery = useGetAccounts()
  const accountMutation = useCreateAccount()
  const onCreateAccount = (name: string) => accountMutation.mutate({ name })
  const accountOptions = (accountQuery.data ?? []).map((account) => ({
    label: account.name,
    value: account.id
  }))

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending

  const isLoading =
    transactionQuery.isLoading ||
    categoryQuery.isLoading ||
    accountQuery.isLoading

  const onSubmit = (values: FormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  const onDelete = async () => {
    const ok = await confirm()

    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose()
        }
      })
    }
  }

  const defaultValues: FormValues = transactionQuery.data
    ? {
        date: transactionQuery.data.date
          ? new Date(transactionQuery.data.date)
          : new Date(),
        categoryId: transactionQuery.data.categoryId,
        amount: transactionQuery.data.amount.toString(),
        accountId: transactionQuery.data.accountId,
        payee: transactionQuery.data.payee,
        notes: transactionQuery.data.notes
      }
    : {
        date: new Date(),
        categoryId: '',
        accountId: '',
        payee: '',
        amount: '',
        notes: ''
      }

  return (
    <>
      <ConfirmDialg />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Transaction</SheetTitle>
            <SheetDescription>Edit an existing transaction.</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absoute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />{' '}
            </div>
          ) : (
            <TransactionForm
              id={id}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              defaultValues={defaultValues}
              accountOptions={accountOptions}
              onCreateAccount={onCreateAccount}
              onCreateCategory={onCreateCategory}
              categoryOptions={categoryOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
