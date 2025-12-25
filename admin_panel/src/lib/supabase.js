import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pqmuleyagoivpjuhbdbi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxbXVsZXlhZ29pdnBqdWhiZGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MjUzMTAsImV4cCI6MjA4MjIwMTMxMH0.K6pJwvLwp7M8MP08aVYyOPPRCMDb1OSTOeFbI6KvbuI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// PC情報を全件取得
export async function fetchAllPcInfo() {
  const { data, error } = await supabase
    .from('pc_inventory')
    .select('*')
    .order('branch_name', { ascending: true })
    .order('pc_name', { ascending: true })

  if (error) throw error
  return data
}

// 営業所一覧を取得
export async function fetchBranches() {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .order('id', { ascending: true })

  if (error) throw error
  return data
}

// 管理者パスワード検証
export async function verifyAdminPassword(password) {
  // SHA-256でハッシュ化
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  const { data: settings, error } = await supabase
    .from('admin_settings')
    .select('password_hash')
    .eq('id', 1)
    .single()

  if (error) throw error
  return settings.password_hash === hashHex
}

// パスワード変更
export async function changeAdminPassword(newPassword) {
  const encoder = new TextEncoder()
  const data = encoder.encode(newPassword)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  const { error } = await supabase
    .from('admin_settings')
    .update({ password_hash: hashHex })
    .eq('id', 1)

  if (error) throw error
}

// PC履歴を取得（特定PCの履歴）
export async function fetchPcHistory(pcName, branchName) {
  const { data, error } = await supabase
    .from('pc_inventory_history')
    .select('*')
    .eq('pc_name', pcName)
    .eq('branch_name', branchName)
    .order('collected_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}

// 全PC履歴を取得（最新順）
export async function fetchAllHistory(limit = 100) {
  const { data, error } = await supabase
    .from('pc_inventory_history')
    .select('id, pc_name, branch_name, collected_at')
    .order('collected_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
