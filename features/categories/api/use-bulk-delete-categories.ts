import type { InferRequestType, InferResponseType } from 'hono'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { client } from '@/lib/hono'

type ResponseType = InferResponseType<
  (typeof client.api.categories)['bulk-delete']['$post']
>
type RequestType = InferRequestType<
  (typeof client.api.categories)['bulk-delete']['$post']
>['json']

export const useBulkDeleteCategories = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.categories['bulk-delete'].$post({ json })
      return await res.json()
    },
    onSuccess: () => {
      toast.success('Categories deleted')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      // TODO: also invalidate summary
    },
    onError: () => {
      toast.error('Failed to delete categories')
    }
  })

  return mutation
}