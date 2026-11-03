-- =====================================================================
-- 同樂小行星 v41：遊戲內管理（刪除／修改／禁言留言）
-- 前置：已執行 v35、v40（需要 is_tongle_admin()、mp_mutes、mp_chat_log）。可重複執行。
-- =====================================================================

-- 1. 留言加上訊息代號（讓遊戲內能對應到那一則）
alter table public.mp_chat_log add column if not exists mid text;
create index if not exists mp_chat_log_mid_idx on public.mp_chat_log (mid);

-- 2. 管理動作紀錄：其他玩家的畫面據此驗證「這是真的管理者動作」，不是偽造廣播
create table if not exists public.mp_mod_actions (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  action     text not null,          -- delete / edit / mute
  mid        text not null,
  text       text,
  by_email   text
);
alter table public.mp_mod_actions enable row level security;
drop policy if exists "modact: read" on public.mp_mod_actions;
create policy "modact: read" on public.mp_mod_actions for select to authenticated using (true);
-- 不建立 insert/update/delete 政策：只有下面的 security definer 函式能寫入

-- 3. 管理函式（內部檢查 is_tongle_admin，非管理者一律拒絕）
create or replace function public.mp_mod_delete(p_mid text) returns bigint
language plpgsql security definer set search_path = public as $$
declare k bigint;
begin
  if not public.is_tongle_admin() then raise exception 'not admin'; end if;
  delete from public.mp_chat_log where mid = p_mid;
  insert into public.mp_mod_actions(action, mid, by_email) values ('delete', p_mid, auth.jwt() ->> 'email') returning id into k;
  return k;
end $$;

create or replace function public.mp_mod_edit(p_mid text, p_text text) returns bigint
language plpgsql security definer set search_path = public as $$
declare k bigint; t text := left(coalesce(p_text, ''), 80);
begin
  if not public.is_tongle_admin() then raise exception 'not admin'; end if;
  update public.mp_chat_log set msg = t where mid = p_mid;
  insert into public.mp_mod_actions(action, mid, text, by_email) values ('edit', p_mid, t, auth.jwt() ->> 'email') returning id into k;
  return k;
end $$;

create or replace function public.mp_mod_mute(p_mid text) returns bigint
language plpgsql security definer set search_path = public as $$
declare k bigint; r record;
begin
  if not public.is_tongle_admin() then raise exception 'not admin'; end if;
  select user_id, email, nick into r from public.mp_chat_log where mid = p_mid limit 1;
  if r.user_id is not null then
    insert into public.mp_mutes(user_id, email, nick, note) values (r.user_id, r.email, r.nick, '遊戲內禁言')
    on conflict (user_id) do nothing;
  end if;
  delete from public.mp_chat_log where mid = p_mid;
  insert into public.mp_mod_actions(action, mid, by_email) values ('mute', p_mid, auth.jwt() ->> 'email') returning id into k;
  return k;
end $$;

revoke all on function public.mp_mod_delete(text), public.mp_mod_edit(text, text), public.mp_mod_mute(text) from public, anon;
grant execute on function public.mp_mod_delete(text), public.mp_mod_edit(text, text), public.mp_mod_mute(text) to authenticated;

-- 4. 管理動作紀錄只留 7 天（排程清理，沿用 v35 的 pg_cron 設定；沒有排程時手動執行即可）
delete from public.mp_mod_actions where created_at < now() - interval '7 days';
