-- PC情報収集システム テーブル定義
-- Supabaseダッシュボード → SQL Editor で実行してください

-- ====================================
-- 営業所マスタテーブル
-- ====================================
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    provider TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 営業所データ挿入
INSERT INTO branches (name, provider) VALUES
    ('大阪本社', '大塚商会'),
    ('佃営業所', 'とくとくBB'),
    ('百島第一', 'とくとくBB'),
    ('岸和田物流センター', 'とくとくBB'),
    ('りんくう物流センター', 'とくとくBB'),
    ('大阪駅前BC', 'ASAHIネット'),
    ('神戸北営業所', 'とくとくBB'),
    ('神明支店', 'とくとくBB'),
    ('神戸物流センター', 'とくとくBB')
ON CONFLICT (name) DO NOTHING;

-- ====================================
-- PC情報メインテーブル
-- ====================================
CREATE TABLE IF NOT EXISTS pc_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- 基本情報
    pc_name TEXT NOT NULL,
    user_name TEXT,
    domain_name TEXT,
    branch_name TEXT NOT NULL,

    -- OS情報
    os_name TEXT,
    os_version TEXT,
    os_edition TEXT,
    os_build TEXT,
    os_install_date TIMESTAMP WITH TIME ZONE,
    os_license_status TEXT,
    last_boot_time TIMESTAMP WITH TIME ZONE,

    -- ハードウェア情報
    cpu_name TEXT,
    cpu_cores INTEGER,
    cpu_threads INTEGER,
    cpu_max_clock TEXT,
    memory_total_gb NUMERIC(10,2),
    memory_type TEXT,
    memory_slots TEXT,
    gpu_name TEXT,
    motherboard TEXT,
    bios_version TEXT,
    serial_number TEXT,
    manufacturer TEXT,
    model TEXT,

    -- ストレージ情報（JSON配列で複数ドライブ対応）
    storage_info JSONB,
    -- 例: [{"drive": "C:", "type": "SSD", "total_gb": 256, "free_gb": 100}]

    -- ネットワーク情報
    ip_address_local TEXT,
    ip_address_global TEXT,
    mac_address TEXT,
    network_adapter TEXT,
    dns_servers TEXT,
    connection_type TEXT,

    -- Office情報
    office_version TEXT,
    office_product TEXT,
    office_license TEXT,

    -- セキュリティ情報
    security_software TEXT,
    security_version TEXT,
    security_status TEXT,
    security_definition_date DATE,
    security_license_expiry DATE,
    windows_defender_status TEXT,
    firewall_enabled BOOLEAN,
    bitlocker_enabled BOOLEAN,

    -- Windows Update
    last_windows_update DATE,

    -- インストール済みソフトウェア（JSON配列）
    installed_software JSONB,
    -- 例: [{"name": "Chrome", "version": "120.0", "publisher": "Google"}]

    -- ブラウザ情報（JSON配列）
    browsers JSONB,
    -- 例: [{"name": "Chrome", "version": "120.0", "default": true}]

    -- メタ情報
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- ユニーク制約（同一PCは1レコード、更新で上書き）
    CONSTRAINT unique_pc UNIQUE (pc_name, branch_name)
);

-- ====================================
-- インデックス作成（検索高速化）
-- ====================================
CREATE INDEX IF NOT EXISTS idx_pc_inventory_branch ON pc_inventory(branch_name);
CREATE INDEX IF NOT EXISTS idx_pc_inventory_collected_at ON pc_inventory(collected_at);
CREATE INDEX IF NOT EXISTS idx_pc_inventory_security_status ON pc_inventory(security_status);
CREATE INDEX IF NOT EXISTS idx_pc_inventory_firewall ON pc_inventory(firewall_enabled);

-- ====================================
-- 更新日時自動更新トリガー
-- ====================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pc_inventory ON pc_inventory;
CREATE TRIGGER trigger_update_pc_inventory
    BEFORE UPDATE ON pc_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ====================================
-- RLS (Row Level Security) ポリシー
-- ====================================
ALTER TABLE pc_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- anon keyでの読み書きを許可（シンプル構成）
CREATE POLICY "Allow all access" ON pc_inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON branches FOR ALL USING (true) WITH CHECK (true);

-- ====================================
-- PC情報収集履歴テーブル
-- ====================================
CREATE TABLE IF NOT EXISTS pc_inventory_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- 参照元PC
    pc_inventory_id UUID REFERENCES pc_inventory(id) ON DELETE CASCADE,
    pc_name TEXT NOT NULL,
    branch_name TEXT NOT NULL,

    -- 収集日時
    collected_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- スナップショット（その時点の全情報をJSON保存）
    snapshot JSONB NOT NULL,

    -- メタ情報
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 履歴テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_pc_history_pc_name ON pc_inventory_history(pc_name, branch_name);
CREATE INDEX IF NOT EXISTS idx_pc_history_collected_at ON pc_inventory_history(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_pc_history_pc_inventory_id ON pc_inventory_history(pc_inventory_id);

-- 履歴テーブルのRLSポリシー
ALTER TABLE pc_inventory_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON pc_inventory_history FOR ALL USING (true) WITH CHECK (true);

-- ====================================
-- 管理者パスワード設定テーブル
-- ====================================
CREATE TABLE IF NOT EXISTS admin_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON admin_settings FOR ALL USING (true) WITH CHECK (true);

-- デフォルトパスワード: admin（後で変更してください）
-- SHA-256ハッシュ化
INSERT INTO admin_settings (password_hash)
VALUES ('8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918')
ON CONFLICT (id) DO NOTHING;

-- ====================================
-- 完了メッセージ
-- ====================================
-- テーブル作成完了！
--
-- 作成されたテーブル:
--   1. branches - 営業所マスタ
--   2. pc_inventory - PC情報メイン
--   3. admin_settings - 管理者パスワード
--
-- デフォルト管理者パスワード: admin
-- ※ 管理画面で変更してください
