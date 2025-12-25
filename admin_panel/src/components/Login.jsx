import { useState } from 'react'
import { verifyAdminPassword } from '../lib/supabase'

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const isValid = await verifyAdminPassword(password)
      if (isValid) {
        onLogin()
      } else {
        setError('パスワードが正しくありません')
      }
    } catch (err) {
      setError('認証エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
          {/* ロゴ・タイトル */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">PC情報管理システム</h1>
            <p className="text-slate-500 mt-2">管理者パスワードを入力してください</p>
          </div>

          {/* ログインフォーム */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="パスワードを入力"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm animate-slide-up">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  確認中...
                </span>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            初期パスワード: admin
          </p>
        </div>
      </div>
    </div>
  )
}
