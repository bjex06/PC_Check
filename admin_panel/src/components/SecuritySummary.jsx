export default function SecuritySummary({ pcList }) {
  // セキュリティ状態を分類
  const categorize = () => {
    let danger = []
    let warning = []
    let normal = []

    pcList.forEach(pc => {
      // 緊急対応必要
      if (!pc.security_software ||
          pc.firewall_enabled === false ||
          pc.security_status?.includes('無効')) {
        danger.push(pc)
      }
      // 要確認
      else if (pc.security_status?.includes('更新必要') ||
               pc.windows_defender_status === '無効') {
        warning.push(pc)
      }
      // 正常
      else {
        normal.push(pc)
      }
    })

    return { danger, warning, normal }
  }

  const { danger, warning, normal } = categorize()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 緊急対応必要 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 card-hover">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">緊急対応必要</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{danger.length}台</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        {danger.length > 0 && (
          <div className="mt-4 space-y-2">
            {danger.slice(0, 3).map(pc => (
              <div key={pc.id} className="text-sm">
                <span className="font-medium text-slate-700">{pc.branch_name}</span>
                <span className="text-slate-400 mx-1">-</span>
                <span className="text-slate-600">{pc.pc_name}</span>
                <p className="text-xs text-red-500 mt-0.5">
                  {!pc.security_software && 'セキュリティソフト未導入'}
                  {pc.firewall_enabled === false && 'ファイアウォール無効'}
                </p>
              </div>
            ))}
            {danger.length > 3 && (
              <p className="text-xs text-slate-400">他 {danger.length - 3}件</p>
            )}
          </div>
        )}
      </div>

      {/* 要確認 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 card-hover">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">要確認</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{warning.length}台</p>
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        {warning.length > 0 && (
          <div className="mt-4 space-y-2">
            {warning.slice(0, 3).map(pc => (
              <div key={pc.id} className="text-sm">
                <span className="font-medium text-slate-700">{pc.branch_name}</span>
                <span className="text-slate-400 mx-1">-</span>
                <span className="text-slate-600">{pc.pc_name}</span>
              </div>
            ))}
            {warning.length > 3 && (
              <p className="text-xs text-slate-400">他 {warning.length - 3}件</p>
            )}
          </div>
        )}
      </div>

      {/* 正常 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 card-hover">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">正常</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{normal.length}台</p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: pcList.length > 0 ? `${(normal.length / pcList.length) * 100}%` : '0%' }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            全体の {pcList.length > 0 ? Math.round((normal.length / pcList.length) * 100) : 0}%
          </p>
        </div>
      </div>
    </div>
  )
}
