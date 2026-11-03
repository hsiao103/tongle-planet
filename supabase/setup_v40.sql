-- 同樂小行星 v40：只貼這一份即可（聊天室管理：禁言、雲端禁用語、資料整理）。可重複執行。
-- 前置：已執行過 v35（有 mp_chat_log、mp_login_log）。這份會一併確保管理者函式存在。

create or replace function public.is_tongle_admin() returns boolean
language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in ('hsiao103@gmail.com');
$$;

-- =====================================================================
-- 【v40 新增】聊天室管理：禁言、雲端禁用語、資料整理（移植自 Tlps-live）
-- 前置：已執行上面的 v35 段落（需要 is_tongle_admin()）。可重複執行。
-- =====================================================================

-- 禁言名單（管理者新增；使用者只能看到自己是否被禁言）
create table if not exists public.mp_mutes (
  user_id    uuid primary key,
  email      text,
  nick       text,
  note       text,
  created_at timestamptz not null default now()
);
alter table public.mp_mutes enable row level security;
drop policy if exists "mute: read own or admin" on public.mp_mutes;
drop policy if exists "mute: admin write" on public.mp_mutes;
drop policy if exists "mute: read own or admin" on public.mp_mutes;
create policy "mute: read own or admin" on public.mp_mutes for select to authenticated using (auth.uid() = user_id or public.is_tongle_admin());
drop policy if exists "mute: admin write" on public.mp_mutes;
create policy "mute: admin write" on public.mp_mutes for all to authenticated using (public.is_tongle_admin()) with check (public.is_tongle_admin());

-- 雲端禁用語（管理頁新增／刪除；所有登入玩家可讀，進遊戲時載入）
create table if not exists public.mp_badwords (
  word       text primary key check (char_length(word) between 1 and 20),
  added_by   text,
  created_at timestamptz not null default now()
);
alter table public.mp_badwords enable row level security;
drop policy if exists "bad: read all" on public.mp_badwords;
drop policy if exists "bad: admin write" on public.mp_badwords;
drop policy if exists "bad: read all" on public.mp_badwords;
create policy "bad: read all" on public.mp_badwords for select to authenticated using (true);
drop policy if exists "bad: admin write" on public.mp_badwords;
create policy "bad: admin write" on public.mp_badwords for all to authenticated using (public.is_tongle_admin()) with check (public.is_tongle_admin());

-- 聊天寫入規則更新：被禁言者寫不進去；單則上限 80 字
drop policy if exists "chat: insert own" on public.mp_chat_log;
create policy "chat: insert own" on public.mp_chat_log for insert to authenticated
  with check (user_id = auth.uid() and char_length(msg) <= 80 and not exists (select 1 from public.mp_mutes m where m.user_id = auth.uid()));

-- 資料整理：超過 90 天的對話與進出紀錄；查看資料表大小；pg_cron 自動排程（沒啟用也不會報錯）
delete from public.mp_chat_log  where created_at < now() - interval '90 days';
delete from public.mp_login_log where created_at < now() - interval '90 days';
select relname as table_name, n_live_tup as approx_rows, pg_size_pretty(pg_total_relation_size(relid)) as total_size
from pg_stat_user_tables where relname like 'mp\_%' escape '\' order by pg_total_relation_size(relid) desc;
do $do$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('tongle-mp-cleanup', '0 19 * * *', $job$
      delete from public.mp_chat_log  where created_at < now() - interval '90 days';
      delete from public.mp_login_log where created_at < now() - interval '90 days';
    $job$);
    raise notice 'pg_cron 排程已建立：tongle-mp-cleanup（每天台灣時間 03:00）';
  else
    raise notice '尚未啟用 pg_cron，略過自動排程（要自動清除請到 Database → Extensions 啟用 pg_cron，再重新執行本檔）。';
  end if;
end
$do$;

-- 依當事人要求刪除其所有資料（預設註解；使用時取消註解並換成當事人信箱）
-- delete from public.mp_chat_log  where email = 'someone@example.edu.tw';
-- delete from public.mp_login_log where email = 'someone@example.edu.tw';
