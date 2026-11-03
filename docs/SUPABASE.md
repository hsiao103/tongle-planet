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

## 5. 對話與登入紀錄（v35）
1. SQL Editor 再執行一次 `supabase/setup.sql`（後半段是 v35 新增；前面的 policy 若已存在會報「already exists」，可只貼「【v35 新增】」以下的部分）。
2. 若要自動清除 90 天前的紀錄：Database → Extensions 啟用 `pg_cron`，取消註解檔尾那段 `cron.schedule` 後執行。
3. 管理者信箱在 `is_tongle_admin()` 的清單（預設 hsiao103@gmail.com；要多人就用逗號加）。
4. 開啟 `https://hsiao103.github.io/tongle-planet/admin.html`，用管理者 Google 帳號登入，即可看「對話紀錄」「登入／進出」，可搜尋、依日期篩選、匯出 CSV、刪除對話。
5. Redirect URLs 若原本是 `…/tongle-planet/**` 已涵蓋 admin.html，不用另外加。
- 玩家端只能寫入自己的紀錄，讀不到任何人的紀錄；資料表尚未建立時，遊戲照常運作、只是不留紀錄。

## 6. 彈出式登入（v37）
- 需要把 `auth-popup.html` 一併放在遊戲網址同一層（與 `index.html` 同資料夾）。
- Redirect URLs 已設成 `https://hsiao103.github.io/tongle-planet/**` 就涵蓋 `auth-popup.html`，不必另外加。
- 瀏覽器若擋住彈窗，會退回整頁登入。

## 7. 聊天室管理（v40）
1. SQL Editor 只貼 `supabase/setup_v40.sql` 這一份執行即可（可重複執行；整份 `setup.sql` 現在也能重複執行）：建立 `mp_mutes`（禁言）、`mp_badwords`（雲端禁用語），並更新聊天寫入規則（被禁言者寫不進去）。
2. 管理頁 `admin.html`：對話列「禁言」鈕、「禁言名單」「禁用語」分頁。
3. 想自動清除 90 天前的紀錄：Database → Extensions 啟用 `pg_cron` 後重新執行該段。
4. 限制：聊天訊息走 Realtime 廣播，伺服器無法攔截；禁言與禁用語由遊戲端執行（一般玩家無法繞過），被禁言者的紀錄寫入也會被資料庫拒絕。

## 8. 遊戲內管理：刪除／修改／禁言留言（v41）
1. SQL Editor 貼 `supabase/setup_v41.sql` 執行（可重複執行；需先跑過 v35、v40）：新增留言代號欄位、管理動作紀錄表 `mp_mod_actions`，以及 `mp_mod_delete`／`mp_mod_edit`／`mp_mod_mute` 三個函式（函式內會檢查是不是管理者）。
2. 用管理者 Google 帳號進多人模式，開聊天視窗，會多一顆「🛠 管理」鈕；按下開啟管理模式，每則留言旁出現「刪除」「修改」「禁言」。
3. 動作會即時同步給在線的所有人（留言與頭上泡泡立刻消失／改字，修改過的留言標示「管理者已修改」），同時更新資料庫的對話紀錄；禁言會寫入禁言名單，對方無法再發言。
4. 安全：其他玩家收到管理指令後，會向資料庫核對該筆動作是否真的存在（只有管理者函式寫得進去），所以無法用偽造廣播刪別人的話。限制：廣播無法由伺服器強制，已看過留言的人若重新整理頁面，歷史會被清空；禁言仍由遊戲端與資料庫寫入規則共同執行。
