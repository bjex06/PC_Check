import { useState } from 'react'
import { changeAdminPassword, verifyAdminPassword } from '../lib/supabase'

export default function Settings({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    // バリデーション
    if (newPassword.length < 4) {
      setMessage({ type: 'error', text: 'パスワードは4文字以上で入力してください' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '新しいパスワードが一致しません' })
      return
    }

    setLoading(true)

    try {
      // 現在のパスワードを確認
      const isValid = await verifyAdminPassword(currentPassword)
      if (!isValid) {
        setMessage({ type: 'error', text: '現在のパスワードが正しくありません' })
        setLoading(false)
        return
      }

      // パスワード変更
      await changeAdminPassword(newPassword)
      setMessage({ type: 'success', text: 'パスワードを変更しました' })

      // フォームをクリア
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

    } catch (err) {
      setMessage({ type: 'error', text: 'エラーが発生しました' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* モーダル */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-slide-up">
          {/* ヘッダー */}
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">設定</h2>
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
          <div className="p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              パスワード変更
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  現在のパスワード
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  新しいパスワード
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                  required
                  minLength={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  新しいパスワード（確認）
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>

              {message.text && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? '変更中...' : 'パスワードを変更'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
