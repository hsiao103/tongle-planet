# 多人上線設定（Supabase + Google 登入）

遊戲網址（GitHub Pages）：`https://hsiao103.github.io/tongle-planet/`
Supabase 專案：`cirypvdtlzmwpaicsmee`（網址 `https://cirypvdtlzmwpaicsmee.supabase.co`）

玩法：開場畫面可選「單人版」或「多人版」，右上角「模式」按鈕也能隨時切換。單人版不連線、不用登入；選多人版才會跳 Google 登入，登入後自動加入頻道，最多 25 人。任何 Google 帳號都可以進入。選擇會記在這台裝置上。

## 一次性設定（依序做）

### 1. Google Cloud：建立 OAuth 用戶端
1. 到 Google Cloud Console，選或建一個專案。
2. 「API 和服務」→「OAuth 同意畫面」：外部、填應用程式名稱與你的 Email；發布狀態建議設為「正式版」，否則只有加入測試使用者的帳號能登入。
3. 「憑證」→ 建立憑證 → **OAuth 用戶端 ID** → 應用程式類型選「網頁應用程式」。
4. 「已授權的重新導向 URI」填：`https://cirypvdtlzmwpaicsmee.supabase.co/auth/v1/callback`
5. 建立後記下 **用戶端 ID** 與 **用戶端密鑰**。

### 2. Supabase：開啟 Google 登入
1. Authentication → Sign In / Providers → **Google** → 啟用。
2. 貼上上一步的用戶端 ID 與密鑰，儲存。
3. Authentication → **URL Configuration**：
   - Site URL：`https://hsiao103.github.io/tongle-planet/`
   - Redirect URLs 新增：`https://hsiao103.github.io/tongle-planet/**`

### 3. Supabase：限制頻道只有登入者能用
1. SQL Editor → 貼上 `supabase/setup.sql` 全部內容 → Run。
2. Realtime → Settings：關閉 **Allow public access**（讓 private 頻道強制檢查上面的規則）。

### 4. 把金鑰放進 config.js
1. Project Settings → API Keys，複製 **anon / publishable** 金鑰（可公開，不是機密）。
2. 在 GitHub 儲存庫點 `config.js` → 鉛筆圖示編輯 → 把 `key` 換成你複製的金鑰 → Commit。
3. **絕對不要**貼 service_role / secret 金鑰。

## 測試
用兩台裝置（或一般視窗加無痕視窗）打開遊戲網址，都選「多人版」並登入，左上角應顯示「線上 2」，並看得到對方的角色與暱稱。

## 用量與限制
- 每人約每 0.25 秒廣播一次位置（`sendMs`），25 人時約每秒 100 則訊息送出。Supabase 免費方案對 Realtime 有每秒訊息數與連線數上限（請以後台 Realtime / Usage 顯示的數字為準）；若遇到限流，把 `config.js` 的 `sendMs` 調成 400 或 500 即可，畫面靠補間仍然順。
- 暱稱不使用 Google 顯示名稱（通常是真名），預設「旅人 + 兩位數字」，在「版本」選單內可自訂。
- 目前只同步「看見彼此」；背包、錢幣、萬聖節進度仍存在各人瀏覽器。
