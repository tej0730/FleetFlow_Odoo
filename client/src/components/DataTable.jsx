import LoadingSpinner from './LoadingSpinner'

export default function DataTable({ columns, data, isLoading, emptyMessage = 'No data found.' }) {
  if (isLoading) {
    return (
      <div className="table-wrapper">
        <table className="ff-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key}>
                    <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-wrapper">
        <table className="ff-table">
          <thead>
            <tr>
              {columns.map(col => <th key={col.key}>{col.header}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length}>
                <div className="py-16 text-center">
                  <p className="text-slate-500 text-sm">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table className="ff-table">
        <thead>
          <tr>
            {columns.map(col => <th key={col.key}>{col.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
