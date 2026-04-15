interface Column<T> {
  label: string
  key?: string
  align?: 'left' | 'right' | 'center'
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  emptyText?: string
}

export function DataTable<T extends Record<string, unknown>>({ columns, rows, emptyText = 'No data' }: DataTableProps<T>) {
  if (!rows || rows.length === 0) {
    return <div className="text-sm text-slate-400 py-4">{emptyText}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="text-slate-400 border-b border-slate-800">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="py-2 pr-4 font-medium whitespace-nowrap"
                style={{ textAlign: col.align || 'left' }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((row, ridx) => (
            <tr key={ridx} className="hover:bg-slate-800/50">
              {columns.map((col, cidx) => {
                const value = col.key ? (row as Record<string, unknown>)[col.key] : undefined
                const content = col.render ? col.render(row) : String(value ?? '-')
                return (
                  <td
                    key={cidx}
                    className="py-2 pr-4 whitespace-nowrap"
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {content}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
