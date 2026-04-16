import { cn } from '../../lib/utils'
import { Skeleton } from '../ui/Skeleton'
import { EmptyState } from '../ui/EmptyState'

type Align = 'left' | 'right' | 'center'

export interface Column<T> {
  key: string
  header: string
  width?: string
  align?: Align
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  loading?: boolean
  density?: 'compact' | 'normal' | 'relaxed'
  emptyTitle?: string
  emptyDescription?: string
  rowActions?: (row: T) => React.ReactNode
  stickyActions?: boolean
}

export function DataTable<T extends { id?: string }>({
  columns,
  rows,
  loading,
  density = 'normal',
  emptyTitle = '暂无数据',
  emptyDescription,
  rowActions,
  stickyActions,
}: DataTableProps<T>) {
  const densityClass = {
    compact: { th: 'py-2 px-3', td: 'py-1.5 px-3' },
    normal: { th: 'py-3 px-4', td: 'py-2.5 px-4' },
    relaxed: { th: 'py-3.5 px-4', td: 'py-3 px-4' },
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-surface-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-950 text-slate-400">
          <tr className="border-b border-surface-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'whitespace-nowrap text-xs font-semibold uppercase tracking-wide',
                  densityClass[density].th,
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center'
                )}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
            {rowActions && (
              <th
                className={cn(
                  'whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-right',
                  densityClass[density].th,
                  stickyActions && 'sticky right-0 bg-slate-950'
                )}
              >
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border bg-surface-elevated">
          {rows.map((row, idx) => (
            <tr key={row.id || idx} className="transition-colors hover:bg-slate-800/40">
              {columns.map((col) => {
                const cellContent = col.render
                  ? col.render(row)
                  : String((row as Record<string, unknown>)[col.key] ?? '-')

                return (
                  <td
                    key={col.key}
                    className={cn(
                      'whitespace-nowrap text-slate-300',
                      densityClass[density].td,
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center'
                    )}
                  >
                    {cellContent}
                  </td>
                )
              })}
              {rowActions && (
                <td
                  className={cn(
                    'text-right',
                    densityClass[density].td,
                    stickyActions && 'sticky right-0 bg-surface-elevated hover:bg-slate-800/40'
                  )}
                >
                  {rowActions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
