-- PC情報収集履歴テーブル追加
-- Supabaseダッシュボード → SQL Editor で実行してください

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
-- 完了メッセージ
-- ====================================
-- 履歴テーブル作成完了！
-- pc_inventory_history テーブルが追加されました
