import { useRef, useState } from 'react'

import { useGetAccounts } from '@/features/accounts/api/use-get-accounts'
import { useCreateAccount } from '@/features/accounts/api/use-create-account'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Select } from '@/components/select'

export const useSelectAccount = (): [
  () => JSX.Element,
  () => Promise<unknown>
] => {
  const accountsQuery = useGetAccounts()
  const accountMutation = useCreateAccount()
  const onCreateAccount = (name: string) => accountMutation.mutate({ name })

  const accountOptions = (accountsQuery.data ?? []).map((account) => ({
    value: account.id,
    label: account.name
  }))

  const [promise, setPromise] = useState<{
    resolve: (value: string | undefined) => void
  } | null>(null)
  const selectValue = useRef<string>()

  const confirm = () =>
    new Promise((resolve, reject) => {
      setPromise({ resolve })
    })

  const handleClose = () => {
    setPromise(null)
  }

  const handleConfirm = () => {
    promise?.resolve(selectValue.current)
    handleClose()
  }

  const handleCancel = () => {
    promise?.resolve(undefined)
    handleClose()
  }

  const ConfirmationDialog = () => (
    <Dialog open={promise !== null} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Account</DialogTitle>
          <DialogDescription>
            Please select an account to continue
          </DialogDescription>
        </DialogHeader>
        <Select
          onCreate={onCreateAccount}
          placeholder="Select an account"
          options={accountOptions}
          onChange={(value) => {
            selectValue.current = value
          }}
          disabled={accountsQuery.isLoading || accountMutation.isPending}
        />
        <DialogFooter className="pt-2 ">
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return [ConfirmationDialog, confirm]
}
