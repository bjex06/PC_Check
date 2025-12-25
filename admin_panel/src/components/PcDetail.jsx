import { useState, useEffect } from 'react'
import { fetchPcHistory } from '../lib/supabase'

export default function PcDetail({ pc, onClose }) {
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  const loadHistory = async () => {
    if (history.length > 0) {
      setShowHistory(!showHistory)
      return
    }
    setLoadingHistory(true)
    try {
      const data = await fetchPcHistory(pc.pc_name, pc.branch_name)
      setHistory(data || [])
      setShowHistory(true)
    } catch (err) {
      console.error('履歴取得エラー:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('ja-JP')
  }

  const formatBytes = (gb) => {
    if (!gb) return '-'
    return `${gb} GB`
  }

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="bg-slate-50 rounded-lg p-4 space-y-2">
        {children}
      </div>
    </div>
  )

  const Row = ({ label, value, danger = false }) => (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium ${danger ? 'text-red-600' : 'text-slate-800'}`}>
        {value || '-'}
      </span>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* モーダル */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-hidden">
          {/* ヘッダー */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{pc.pc_name}</h2>
                <p className="text-sm text-slate-500">{pc.branch_name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* コンテンツ */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 基本情報 */}
              <Section title="基本情報">
                <Row label="PC名" value={pc.pc_name} />
                <Row label="ユーザー名" value={pc.user_name} />
                <Row label="ドメイン" value={pc.domain_name} />
                <Row label="営業所" value={pc.branch_name} />
              </Section>

              {/* OS情報 */}
              <Section title="OS情報">
                <Row label="OS" value={pc.os_name} />
                <Row label="エディション" value={pc.os_edition} />
                <Row label="ビルド" value={pc.os_build} />
                <Row label="ライセンス" value={pc.os_license_status} />
                <Row label="インストール日" value={formatDate(pc.os_install_date)} />
                <Row label="最終起動" value={formatDate(pc.last_boot_time)} />
              </Section>

              {/* ハードウェア情報 */}
              <Section title="ハードウェア">
                <Row label="CPU" value={pc.cpu_name} />
                <Row label="コア/スレッド" value={pc.cpu_cores && pc.cpu_threads ? `${pc.cpu_cores}コア / ${pc.cpu_threads}スレッド` : null} />
                <Row label="メモリ" value={formatBytes(pc.memory_total_gb)} />
                <Row label="メモリタイプ" value={pc.memory_type} />
                <Row label="GPU" value={pc.gpu_name} />
                <Row label="マザーボード" value={pc.motherboard} />
                <Row label="メーカー" value={pc.manufacturer} />
                <Row label="モデル" value={pc.model} />
                <Row label="シリアル" value={pc.serial_number} />
              </Section>

              {/* ネットワーク情報 */}
              <Section title="ネットワーク">
                <Row label="ローカルIP" value={pc.ip_address_local} />
                <Row label="グローバルIP" value={pc.ip_address_global} />
                <Row label="MACアドレス" value={pc.mac_address} />
                <Row label="アダプタ" value={pc.network_adapter} />
                <Row label="接続タイプ" value={pc.connection_type} />
                <Row label="DNS" value={pc.dns_servers} />
              </Section>

              {/* セキュリティ情報 */}
              <Section title="セキュリティ">
                <Row
                  label="セキュリティソフト"
                  value={pc.security_software || '未インストール'}
                  danger={!pc.security_software}
                />
                <Row label="バージョン" value={pc.security_version} />
                <Row
                  label="セキュリティソフト状態"
                  value={pc.security_status || (pc.security_software ? '不明' : '-')}
                  danger={pc.security_status === '無効' || pc.security_status?.includes('無効')}
                />
                <Row
                  label="Windows Defender"
                  value={pc.windows_defender_status || '不明'}
                  danger={pc.windows_defender_status === '無効'}
                />
                <Row
                  label="ファイアウォール"
                  value={pc.firewall_enabled === true ? '有効' : pc.firewall_enabled === false ? '無効' : '不明'}
                  danger={pc.firewall_enabled === false}
                />
                <Row
                  label="BitLocker (Cドライブ)"
                  value={pc.bitlocker_enabled === true ? '有効' : pc.bitlocker_enabled === false ? '無効' : '不明'}
                />
                <Row label="最終Windows Update" value={formatDate(pc.last_windows_update)} />
              </Section>

              {/* Office情報 */}
              <Section title="Office">
                <Row label="製品" value={pc.office_product} />
                <Row label="バージョン" value={pc.office_version} />
                <Row label="ライセンス" value={pc.office_license} />
              </Section>
            </div>

            {/* ストレージ情報 */}
            {pc.storage_info && pc.storage_info.length > 0 && (
              <Section title="ストレージ">
                <div className="space-y-3">
                  {pc.storage_info.map((storage, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                          <span className="text-xs font-bold text-slate-600">{storage.drive}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{storage.model || 'ドライブ'}</p>
                          <p className="text-xs text-slate-500">{storage.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-800">
                          {storage.free_gb} / {storage.total_gb} GB 空き
                        </p>
                        <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1">
                          <div
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${((storage.total_gb - storage.free_gb) / storage.total_gb) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ブラウザ情報 */}
            {pc.browsers && pc.browsers.length > 0 && (
              <Section title="インストール済みブラウザ">
                <div className="flex flex-wrap gap-2">
                  {pc.browsers.map((browser, index) => (
                    <span
                      key={index}
                      className={`badge ${browser.is_default ? 'badge-info' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {browser.name} {browser.version && `(${browser.version.split('.')[0]})`}
                      {browser.is_default && ' - デフォルト'}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* インストール済みソフトウェア */}
            {pc.installed_software && pc.installed_software.length > 0 && (
              <Section title={`インストール済みソフトウェア (${pc.installed_software.length}件)`}>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {pc.installed_software.map((software, index) => (
                    <div key={index} className="flex justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                      <span className="text-slate-700 truncate max-w-[60%]">{software.name}</span>
                      <span className="text-slate-400">{software.version || '-'}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* 収集履歴 */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={loadHistory}
                className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                disabled={loadingHistory}
              >
                {loadingHistory ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                <span>収集履歴を{showHistory ? '閉じる' : '表示'}</span>
              </button>

              {showHistory && history.length > 0 && (
                <div className="mt-3 max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="text-left py-2 px-3 text-slate-500 font-medium">収集日時</th>
                        <th className="text-left py-2 px-3 text-slate-500 font-medium">セキュリティ</th>
                        <th className="text-left py-2 px-3 text-slate-500 font-medium">IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((item, index) => (
                        <tr key={item.id} className={index === 0 ? 'bg-primary-50' : 'hover:bg-slate-50'}>
                          <td className="py-2 px-3 text-slate-700">
                            {formatDate(item.collected_at)}
                            {index === 0 && <span className="ml-2 text-xs text-primary-600">(最新)</span>}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {item.snapshot?.security_software || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {item.snapshot?.ip_address_local || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showHistory && history.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-4">履歴がありません</p>
              )}
            </div>

            {/* メタ情報 */}
            <div className="mt-4 text-xs text-slate-400 text-center">
              最終収集日時: {formatDate(pc.collected_at)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
