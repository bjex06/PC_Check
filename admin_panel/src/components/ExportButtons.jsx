import * as XLSX from 'xlsx'

export default function ExportButtons({ pcList }) {
  // データを整形
  const formatDataForExport = () => {
    return pcList.map(pc => ({
      '営業所': pc.branch_name,
      'PC名': pc.pc_name,
      'ユーザー名': pc.user_name,
      'ドメイン': pc.domain_name,
      'OS': pc.os_name,
      'OSエディション': pc.os_edition,
      'OSビルド': pc.os_build,
      'ライセンス状態': pc.os_license_status,
      'CPU': pc.cpu_name,
      'CPUコア数': pc.cpu_cores,
      'CPUスレッド数': pc.cpu_threads,
      'メモリ(GB)': pc.memory_total_gb,
      'メモリタイプ': pc.memory_type,
      'GPU': pc.gpu_name,
      'メーカー': pc.manufacturer,
      'モデル': pc.model,
      'シリアル番号': pc.serial_number,
      'ローカルIP': pc.ip_address_local,
      'グローバルIP': pc.ip_address_global,
      'MACアドレス': pc.mac_address,
      'ネットワークアダプタ': pc.network_adapter,
      'セキュリティソフト': pc.security_software,
      'セキュリティ状態': pc.security_status,
      'Windows Defender': pc.windows_defender_status,
      'ファイアウォール': pc.firewall_enabled === true ? '有効' : pc.firewall_enabled === false ? '無効' : '不明',
      'BitLocker': pc.bitlocker_enabled === true ? '有効' : pc.bitlocker_enabled === false ? '無効' : '不明',
      '最終Windows Update': pc.last_windows_update ? new Date(pc.last_windows_update).toLocaleDateString('ja-JP') : '',
      'Office製品': pc.office_product,
      'Officeバージョン': pc.office_version,
      '収集日時': pc.collected_at ? new Date(pc.collected_at).toLocaleString('ja-JP') : '',
    }))
  }

  // Excel出力
  const exportToExcel = () => {
    const data = formatDataForExport()
    const ws = XLSX.utils.json_to_sheet(data)

    // 列幅を自動調整
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length * 2, 15)
    }))
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'PC情報')

    const fileName = `PC情報_${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  // CSV出力
  const exportToCsv = () => {
    const data = formatDataForExport()
    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)

    // BOM付きUTF-8でエクスポート（Excel対応）
    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `PC情報_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex space-x-2">
      <button
        onClick={exportToExcel}
        className="btn btn-success text-sm"
        disabled={pcList.length === 0}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Excel
      </button>
      <button
        onClick={exportToCsv}
        className="btn btn-secondary text-sm"
        disabled={pcList.length === 0}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        CSV
      </button>
    </div>
  )
}
