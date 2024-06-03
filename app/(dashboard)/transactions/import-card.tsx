import { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { convertAmountToMiliunits, formatDate } from '@/lib/utils'

import { ImportTable } from './import-table'

const requiredOptions = ['amount', 'date', 'payee']

interface SelectedColumsState {
  [key: string]: string | null
}

type Props = {
  data: string[][]
  onCancel: () => void
  onSubmit: (data: any) => void
}

export const ImportCard = ({ data, onCancel, onSubmit }: Props) => {
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumsState>(
    {}
  )
  const headers = data[0]
  const body = data.slice(1)

  const onTableHeadSelectChange = (
    columnIndex: number,
    value: string | null
  ) => {
    setSelectedColumns((prev) => {
      const newSelectedColumnns = { ...prev }

      for (const key in newSelectedColumnns) {
        if (newSelectedColumnns[key] === value) {
          newSelectedColumnns[key] = null
        }
      }

      let newValue = value
      if (value === 'skip') {
        newValue = null
      }

      newSelectedColumnns[`column_${columnIndex}`] = newValue

      return newSelectedColumnns
    })
  }

  const progress = Object.values(selectedColumns).filter(Boolean).length

  const handleContinue = () => {
    const mappedData = {
      header: headers.map((_header, index) => {
        return selectedColumns[`column_${index}`] || null
      }),
      body: body
        .map((row) => {
          const transformedRow = row.map((cell, index) => {
            return selectedColumns[`column_${index}`] ? cell : null
          })

          return transformedRow.every((item) => item === null)
            ? []
            : transformedRow
        })
        .filter((row) => row.length > 0)
    }
    const arrayOfData = mappedData.body.map((row) => {
      return row.reduce((acc: any, cell, index) => {
        const header = mappedData.header[index]
        if (header !== null) {
          acc[header] = cell
        }
        return acc
      }, {})
    })

    const formattedData = arrayOfData.map((item) => ({
      ...item,
      amount: convertAmountToMiliunits(Number.parseFloat(item.amount)),
      date: formatDate(item.date)
    }))

    onSubmit(formattedData)
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Import Transaction
          </CardTitle>
          <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
            <Button onClick={onCancel} size="sm" className="w-full lg:w-auto">
              Cancel
            </Button>
            <Button
              className="w-full lg:w-auto"
              size="sm"
              disabled={progress < requiredOptions.length}
              onClick={handleContinue}
            >
              Continue ({progress} / {requiredOptions.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ImportTable
            headers={headers}
            body={body}
            selectedColumns={selectedColumns}
            onTableHeadSelectChange={onTableHeadSelectChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}
