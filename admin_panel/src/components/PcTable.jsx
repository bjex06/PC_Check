export default function PcTable({ pcList, onSelectPc }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('ja-JP')
  }

  const getSecurityBadge = (pc) => {
    if (!pc.security_software || pc.firewall_enabled === false) {
      return <span className="badge badge-danger">要対応</span>
    }
    if (pc.security_status?.includes('更新必要')) {
      return <span className="badge badge-warning">要確認</span>
    }
    return <span className="badge badge-success">正常</span>
  }

  if (pcList.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <svg className="w-12 h-12 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="mt-4 text-slate-500">PC情報がありません</p>
        <p className="text-sm text-slate-400 mt-1">PC_Check.exeを実行してデータを送信してください</p>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              PC名
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              営業所
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ユーザー
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              OS
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              セキュリティ
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              IPアドレス
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              最終収集
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              状態
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pcList.map((pc) => (
            <tr
              key={pc.id}
              onClick={() => onSelectPc(pc)}
              className="hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-800">{pc.pc_name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {pc.branch_name}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {pc.user_name || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {pc.os_name ? (
                  <span className="truncate max-w-[150px] block" title={pc.os_name}>
                    {pc.os_name.replace('Microsoft ', '').replace('Windows', 'Win')}
                  </span>
                ) : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {pc.security_software ? (
                  <span className="truncate max-w-[120px] block" title={pc.security_software}>
                    {pc.security_software}
                  </span>
                ) : (
                  <span className="text-red-500">未導入</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                {pc.ip_address_local || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">
                {formatDate(pc.collected_at)}
              </td>
              <td className="px-6 py-4">
                {getSecurityBadge(pc)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
