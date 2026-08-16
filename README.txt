STEP 3: 3件の今後のイベント
- Supabaseに events テーブルを作成済み。
- 公開サイトは今日以降のイベントを日付順に最大3件取得。
- 一番早いイベントが NEXT EVENT として大きく表示。
- 開催日を過ぎると自動的に次のイベントが先頭へ。
- 管理画面からイベントを追加・編集・削除できます。

GitHub:
1. admin/admin-v3.html を admin/index.html に置き換え
2. admin/admin-v3.js を admin/admin-v3.js に入れる
3. admin/admin.css を上書き
4. public-db-v2.js を public-db.js に置き換え
5. upcoming-events.css を style.css の末尾に追加
6. 公開ページの表示したい場所に <div id="upcoming-events" class="upcoming-grid"></div> を追加
7. 公開ページの<head>に Supabase JS と supabase-config.js、本文末尾に public-db.js を読み込む
