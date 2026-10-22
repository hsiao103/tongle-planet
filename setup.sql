-- 在 Supabase 後台 SQL Editor 貼上執行一次。
-- 作用：只讓「已登入」的使用者收發 tongle-planet 頻道的訊息（位置廣播與上線偵測）。
-- 未登入的人拿不到也送不出任何訊息。

create policy "tongle-planet: authenticated can receive"
on realtime.messages for select to authenticated
using ( realtime.topic() = 'tongle-planet' );

create policy "tongle-planet: authenticated can send"
on realtime.messages for insert to authenticated
with check ( realtime.topic() = 'tongle-planet' );
