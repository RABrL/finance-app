import { Skeleton } from "./ui/skeleton"

export const TableLoading = () => {
  return (
    <>
      <Skeleton className="h-11 max-w-sm my-4" />
      <Skeleton className="h-[300px] w-full" />
      <div className="flex items-center w-full">
        <div className="flex-1 text-sm text-muted-foreground">
          <Skeleton className="h-5 w-3 -my-1 rounded-sm inline-block" /> of{' '}
          <Skeleton className="h-5 w-3 -my-1 rounded-sm inline-block" /> row(s)
          selected.
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </>
  )
}
