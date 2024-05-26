'use client'

import { Plus } from 'lucide-react'

import { useNewCategory } from '@/features/categories/hooks/use-new-category'
import { useGetCategories } from '@/features/categories/api/use-get-categories'
import { useBulkDeleteCategories } from '@/features/categories/api/use-bulk-delete-categories'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { TableLoading } from '@/components/table-loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { columns } from './columns'

const CategoriesPage = () => {
  const { onOpen } = useNewCategory()

  const categoriesQuery = useGetCategories()
  const deleteCategoriesQuery = useBulkDeleteCategories()

  const categories = categoriesQuery.data || []

  const isDisabled =
    categoriesQuery.isLoading || deleteCategoriesQuery.isPending

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">Categories</CardTitle>
          <Button onClick={onOpen} size="sm">
            <Plus className="size-4 mr-2" />
            Add New
          </Button>
        </CardHeader>
        <CardContent>
          {categoriesQuery.isLoading ? (
            <TableLoading />
          ) : (
            <DataTable
              columns={columns}
              data={categories}
              filterKey="name"
              onDelete={(rows) => {
                const ids = rows.map((row) => row.original.id)
                deleteCategoriesQuery.mutate({ ids })
              }}
              disabled={isDisabled}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CategoriesPage
