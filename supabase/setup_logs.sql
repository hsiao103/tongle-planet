-- 多人版紀錄（登入／聊天）：在 Supabase 後台 SQL Editor 貼上執行一次（可重複執行）。
-- 遊戲端（sbLog）會對 mp_login_log、mp_chat_log 各寫入：
--   進出：{ nick, event: 'join' | 'leave' }      聊天：{ nick, msg }
-- 權限：已登入的玩家只能「新增」自己的紀錄，不能讀、改、刪；只有管理者（tongle_admin 名單）能查詢與刪除。
-- 不儲存信箱或真名；user_id 是 Supabase 內部編號，只供管理者在後台對照同一人。

create table if not exists tongle_admin (email text primary key);
alter table tongle_admin enable row level security;

create or replace function tongle_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from tongle_admin where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
$$;
revoke all on function tongle_is_admin() from public, anon;
grant execute on function tongle_is_admin() to authenticated;

create table if not exists mp_login_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid(),
  nick text not null check (char_length(nick) between 1 and 20),
  event text not null check (event in ('join', 'leave'))
);
create table if not exists mp_chat_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid(),
  nick text not null check (char_length(nick) between 1 and 20),
  msg text not null check (char_length(msg) between 1 and 200)
);
create index if not exists mp_login_log_created on mp_login_log (created_at desc);
create index if not exists mp_chat_log_created on mp_chat_log (created_at desc);

alter table mp_login_log enable row level security;
alter table mp_chat_log enable row level security;
do $$ declare t text; begin
  foreach t in array array['mp_login_log', 'mp_chat_log'] loop
    execute format('drop policy if exists "%1$s insert" on %1$s', t);
    execute format('drop policy if exists "%1$s admin read" on %1$s', t);
    execute format('drop policy if exists "%1$s admin delete" on %1$s', t);
    execute format('create policy "%1$s insert" on %1$s for insert to authenticated with check (user_id = auth.uid())', t);
    execute format('create policy "%1$s admin read" on %1$s for select to authenticated using (tongle_is_admin())', t);
    execute format('create policy "%1$s admin delete" on %1$s for delete to authenticated using (tongle_is_admin())', t);
  end loop;
end $$;
grant insert on mp_login_log, mp_chat_log to authenticated;
grant select, delete on mp_login_log, mp_chat_log to authenticated;      -- 實際能否讀／刪仍由上面的 policy（管理者）決定

-- 清除 N 天前的紀錄（privacy.html 寫保留 90 天）。管理頁有按鈕；也可手動：select tongle_purge_logs(90);
create or replace function tongle_purge_logs(p_days int default 90) returns int
language plpgsql security definer set search_path = public as $$
declare a int; b int;
begin
  if not tongle_is_admin() then raise exception 'admin only'; end if;
  p_days := greatest(coalesce(p_days, 90), 1);
  delete from mp_login_log where created_at < now() - make_interval(days => p_days); get diagnostics a = row_count;
  delete from mp_chat_log where created_at < now() - make_interval(days => p_days); get diagnostics b = row_count;
  return a + b;
end $$;
revoke all on function tongle_purge_logs(int) from public, anon;
grant execute on function tongle_purge_logs(int) to authenticated;

-- 最後一步（手動；若已執行過 setup_event.sql 就已經有管理者，不用再加）：
-- insert into tongle_admin (email) values ('老師的信箱@gmail.com');
