import { TriangleAlert } from 'lucide-react'

import { useOpenCategory } from '@/features/categories/hooks/use-open-categories'

import { cn } from '@/lib/utils'
import { useOpenTransaction } from '@/features/transactions/hooks/use-open-transaction'

type Props = {
  id: string
  category: string | null
  categoryId: string | null
}

export const CategoryColumn = ({ id, category, categoryId }: Props) => {
  const { onOpen: onOpenCategory } = useOpenCategory()
  const { onOpen: onOpenTransaction } = useOpenTransaction()

  const onClick = () => {
    if (categoryId) {
      onOpenCategory(categoryId)
    } else {
      onOpenTransaction(id)
    }
  }
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      onClick={onClick}
      className={cn(
        'flex items-center cursor-pointer hover:underline',
        !category && ' text-rose-500'
      )}
    >
      {!category && <TriangleAlert className="size-4 mr-2 shrink-o" />}
      {category || 'Uncategorized'}
    </div>
  )
}
