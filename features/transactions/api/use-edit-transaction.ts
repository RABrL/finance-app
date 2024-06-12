import type { InferRequestType, InferResponseType } from 'hono'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { client } from '@/lib/hono'

type ResponseType = InferResponseType<
  (typeof client.api.transactions)[':id']['$patch']
>
type RequestType = InferRequestType<
  (typeof client.api.transactions)[':id']['$patch']
>['json']

export const useEditTransaction = (id?: string) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.transactions[':id'].$patch({
        json,
        param: { id }
      })
      return await res.json()
    },
    onSuccess: () => {
      toast.success('Transaction updated')
      queryClient.invalidateQueries({ queryKey: ['transaction', { id }] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
    onError: () => {
      toast.error('Failed to update transaction')
    }
  })

  return mutation
}
