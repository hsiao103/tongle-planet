-- 第三階段：全班共同 Boss 與節慶開關。在 Supabase 後台 SQL Editor 貼上執行一次（可重複執行）。
-- 設計：資料表只能「讀」，所有寫入都走下面的函式，由伺服器檢查傷害上限與出擊間隔，避免有人直接改血量。

create table if not exists tongle_admin (email text primary key);        -- 管理者（老師）的 Google 信箱，下面手動加入
create table if not exists tongle_event (
  id text primary key default 'main',
  festival text not null default 'auto',          -- auto / halloween / teacher / dragon / newyear / christmas
  boss_name text not null default '校園大魔王',
  boss_max int not null default 20000,
  boss_hp int not null default 20000,
  round int not null default 1,
  defeated_at timestamptz,
  last_hitter text,
  updated_at timestamptz not null default now()
);
create table if not exists tongle_hits (
  round int not null,
  uid uuid not null,
  nick text not null default '旅人',
  dmg int not null default 0,
  hits int not null default 0,
  last_at timestamptz not null default now(),
  primary key (round, uid)
);
insert into tongle_event (id) values ('main') on conflict do nothing;

alter table tongle_admin enable row level security;                       -- 不開任何 policy：只有函式能讀
alter table tongle_event enable row level security;
alter table tongle_hits enable row level security;
drop policy if exists "event read" on tongle_event;
drop policy if exists "hits read" on tongle_hits;
create policy "event read" on tongle_event for select to anon, authenticated using (true);
create policy "hits read" on tongle_hits for select to anon, authenticated using (true);

create or replace function tongle_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from tongle_admin where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
$$;

-- 出擊：每次最多 3000 傷害，同一人兩次出擊至少間隔 20 秒
create or replace function tongle_boss_hit(p_dmg int, p_nick text) returns tongle_event
language plpgsql security definer set search_path = public as $$
declare e tongle_event; d int; n text; h tongle_hits; v_real int;
begin
  if auth.uid() is null then raise exception 'login required'; end if;
  d := least(greatest(coalesce(p_dmg, 0), 0), 3000);
  n := left(regexp_replace(coalesce(nullif(p_nick, ''), '旅人'), '[[:cntrl:]]', '', 'g'), 12);
  select * into e from tongle_event where id = 'main' for update;
  if e.boss_hp <= 0 or d = 0 then return e; end if;
  select * into h from tongle_hits where round = e.round and uid = auth.uid();
  if found and h.last_at > now() - interval '20 seconds' then raise exception 'too fast'; end if;
  v_real := least(d, e.boss_hp);
  insert into tongle_hits (round, uid, nick, dmg, hits, last_at) values (e.round, auth.uid(), n, v_real, 1, now())
    on conflict (round, uid) do update set dmg = tongle_hits.dmg + v_real, hits = tongle_hits.hits + 1, nick = excluded.nick, last_at = now();
  update tongle_event set boss_hp = boss_hp - v_real, updated_at = now(),
    last_hitter = case when boss_hp - v_real <= 0 then n else last_hitter end,
    defeated_at = case when boss_hp - v_real <= 0 then now() else defeated_at end
  where id = 'main' returning * into e;
  return e;
end $$;

-- 管理：只切換節慶
create or replace function tongle_festival_set(p_festival text) returns tongle_event
language plpgsql security definer set search_path = public as $$
declare e tongle_event;
begin
  if not tongle_is_admin() then raise exception 'admin only'; end if;
  if p_festival not in ('auto','halloween','teacher','dragon','newyear','christmas') then raise exception 'bad festival'; end if;
  update tongle_event set festival = p_festival, updated_at = now() where id = 'main' returning * into e;
  return e;
end $$;

-- 管理：開新一輪 Boss（同時設定節慶、名稱、血量）
create or replace function tongle_boss_new(p_festival text, p_name text, p_max int) returns tongle_event
language plpgsql security definer set search_path = public as $$
declare e tongle_event;
begin
  if not tongle_is_admin() then raise exception 'admin only'; end if;
  if p_festival not in ('auto','halloween','teacher','dragon','newyear','christmas') then raise exception 'bad festival'; end if;
  update tongle_event set festival = p_festival, boss_name = left(coalesce(nullif(p_name, ''), '校園大魔王'), 12),
    boss_max = least(greatest(coalesce(p_max, 20000), 1000), 200000), boss_hp = least(greatest(coalesce(p_max, 20000), 1000), 200000),
    round = round + 1, defeated_at = null, last_hitter = null, updated_at = now()
  where id = 'main' returning * into e;
  return e;
end $$;

revoke all on function tongle_is_admin(), tongle_boss_hit(int, text), tongle_festival_set(text), tongle_boss_new(text, text, int) from public, anon;
grant execute on function tongle_is_admin(), tongle_boss_hit(int, text), tongle_festival_set(text), tongle_boss_new(text, text, int) to authenticated;
grant execute on function tongle_is_admin() to anon;

-- 讓所有人的畫面即時更新血量
do $$ begin alter publication supabase_realtime add table tongle_event; exception when duplicate_object then null; end $$;

-- 最後一步（手動，換成老師自己的 Google 信箱；不要把信箱寫進公開的儲存庫）：
-- insert into tongle_admin (email) values ('老師的信箱@gmail.com');
