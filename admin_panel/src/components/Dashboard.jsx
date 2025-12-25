import { useState, useEffect } from 'react'
import { fetchAllPcInfo, fetchBranches } from '../lib/supabase'
import SecuritySummary from './SecuritySummary'
import PcTable from './PcTable'
import PcDetail from './PcDetail'
import ExportButtons from './ExportButtons'
import Settings from './Settings'

export default function Dashboard({ onLogout }) {
  const [pcList, setPcList] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPc, setSelectedPc] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  // フィルター状態
  const [filterBranch, setFilterBranch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [pcs, branchList] = await Promise.all([
        fetchAllPcInfo(),
        fetchBranches()
      ])
      setPcList(pcs || [])
      setBranches(branchList || [])
    } catch (err) {
      console.error('データ取得エラー:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // フィルタリング
  const filteredPcList = pcList.filter(pc => {
    // 営業所フィルター
    if (filterBranch && pc.branch_name !== filterBranch) return false

    // ステータスフィルター
    if (filterStatus === 'danger') {
      const isDanger = !pc.security_software ||
                       pc.firewall_enabled === false ||
                       pc.security_status === '無効' ||
                       pc.security_status?.includes('無効') ||
                       pc.windows_defender_status === '無効'
      if (!isDanger) return false
    } else if (filterStatus === 'warning') {
      const isWarning = pc.security_status?.includes('更新必要')
      if (!isWarning) return false
    }

    // 検索クエリ
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchPcName = pc.pc_name?.toLowerCase().includes(query)
      const matchUser = pc.user_name?.toLowerCase().includes(query)
      const matchIp = pc.ip_address_local?.includes(query)
      if (!matchPcName && !matchUser && !matchIp) return false
    }

    return true
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">PC情報管理システム</h1>
                <p className="text-xs text-slate-500">全{pcList.length}台のPC</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={loadData}
                className="btn btn-secondary text-sm"
                disabled={loading}
              >
                <svg className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                更新
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="btn btn-secondary text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={onLogout}
                className="btn btn-secondary text-sm"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* セキュリティサマリー */}
        <SecuritySummary pcList={pcList} />

        {/* フィルター・検索・エクスポート */}
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* 検索 */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="PC名、ユーザー名、IPで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* 営業所フィルター */}
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="select w-auto"
            >
              <option value="">全営業所</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.name}>{branch.name}</option>
              ))}
            </select>

            {/* ステータスフィルター */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select w-auto"
            >
              <option value="">全ステータス</option>
              <option value="danger">緊急対応必要</option>
              <option value="warning">要確認</option>
            </select>

            {/* エクスポートボタン */}
            <ExportButtons pcList={filteredPcList} />
          </div>

          {/* フィルター結果 */}
          <div className="mt-3 text-sm text-slate-500">
            {filteredPcList.length}件を表示
            {(filterBranch || filterStatus || searchQuery) && (
              <button
                onClick={() => {
                  setFilterBranch('')
                  setFilterStatus('')
                  setSearchQuery('')
                }}
                className="ml-2 text-primary-600 hover:underline"
              >
                フィルターをクリア
              </button>
            )}
          </div>
        </div>

        {/* PCテーブル */}
        <div className="mt-6">
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-slate-500">データを読み込み中...</p>
            </div>
          ) : (
            <PcTable pcList={filteredPcList} onSelectPc={setSelectedPc} />
          )}
        </div>
      </main>

      {/* PC詳細モーダル */}
      {selectedPc && (
        <PcDetail pc={selectedPc} onClose={() => setSelectedPc(null)} />
      )}

      {/* 設定モーダル */}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
