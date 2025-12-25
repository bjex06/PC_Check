# PC情報収集・管理システム

社内PCの情報を自動収集し、Webで一元管理するシステムです。

## システム構成

```
PC_Check.exe (各営業所PC) → Supabase (クラウドDB) ← 管理画面 (Cloudflare Pages)
```

## セットアップ手順

### 1. Supabaseのテーブル作成

1. [Supabase](https://supabase.com)にログイン
2. プロジェクト「pc-check」を開く
3. 左メニュー → **SQL Editor** をクリック
4. `supabase/create_tables.sql` の内容をコピー&ペースト
5. **Run** ボタンをクリック

✅ 完了すると3つのテーブルが作成されます:
- `branches` - 営業所マスタ
- `pc_inventory` - PC情報
- `admin_settings` - 管理者設定

---

### 2. 管理画面のデプロイ (Cloudflare Pages)

#### 2-1. GitHubにプッシュ

```bash
# PC_Checkリポジトリにadmin_panelフォルダの内容をプッシュ
cd admin_panel
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/PC_Check.git
git push -u origin main
```

#### 2-2. Cloudflare Pagesで接続

1. [Cloudflare Dashboard](https://dash.cloudflare.com) にログイン
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. GitHubアカウントを接続し、`PC_Check`リポジトリを選択
4. ビルド設定:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. **Save and Deploy** をクリック

✅ デプロイ完了後、URLが発行されます（例: `https://pc-check.pages.dev`）

---

### 3. PC_Check.exe のビルド

#### 必要環境
- Visual Studio 2022
- .NET Framework 4.8 SDK

#### ビルド手順

1. `pc_check_exe/PcCheck.sln` をVisual Studioで開く
2. ビルド構成を **Release** に変更
3. メニュー → **ビルド** → **ソリューションのビルド**
4. `pc_check_exe/PcCheck/bin/Release/PC_Check.exe` が生成される

---

## 使い方

### ユーザー側（各営業所）

1. `PC_Check.exe` をダブルクリック
2. 営業所をドロップダウンから選択
3. 「情報取得・送信」ボタンをクリック
4. 「送信完了しました!」と表示されたら終了

### 管理側

1. ブラウザで管理画面URLにアクセス
2. パスワードを入力してログイン（初期: `admin`）
3. PC一覧、セキュリティ状況を確認
4. Excel/CSVで出力可能

---

## ファイル構成

```
pc_check_tool/
├── supabase/
│   └── create_tables.sql    # DBテーブル作成SQL
├── pc_check_exe/
│   └── PcCheck/             # C# WPFプロジェクト
│       ├── PcCheck.csproj
│       ├── MainWindow.xaml
│       ├── MainWindow.xaml.cs
│       ├── PcInfo.cs
│       ├── PcInfoCollector.cs
│       └── SupabaseClient.cs
├── admin_panel/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── PcTable.jsx
│   │   │   ├── PcDetail.jsx
│   │   │   ├── SecuritySummary.jsx
│   │   │   ├── ExportButtons.jsx
│   │   │   └── Settings.jsx
│   │   ├── lib/
│   │   │   └── supabase.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## 収集情報一覧

| カテゴリ | 項目 |
|---------|------|
| 基本情報 | PC名、ユーザー名、ドメイン、営業所 |
| OS | 名前、バージョン、エディション、ビルド、ライセンス状態 |
| ハードウェア | CPU、メモリ、GPU、ストレージ、マザーボード |
| ネットワーク | ローカルIP、グローバルIP、MAC、DNS |
| セキュリティ | セキュリティソフト、Defender、ファイアウォール、BitLocker |
| ソフトウェア | Office、インストール済みソフト、ブラウザ |

---

## 初期パスワード

管理画面: `admin`

※ログイン後、設定画面から変更してください。

---

## トラブルシューティング

### PC_Check.exeが起動しない
- .NET Framework 4.8がインストールされているか確認

### 送信エラーが出る
- インターネット接続を確認
- ファイアウォールでHTTPSが許可されているか確認

### 管理画面にログインできない
- パスワードが正しいか確認（初期: admin）
- ブラウザのキャッシュをクリア
