公開サイトの最終修正版です。
GitHubのルートにある script.js を、この script.js に置き換えてください。

この版は、
- Supabaseの events テーブルから未来のイベントを取得
- 最大3件を日付順に表示
- 一番近いものをNEXT EVENTとして大きく表示
- 過去の日付は自動除外
- 古いEVENT HTMLが残っていても #event 内に自動で新しい表示を作成
します。

supabase-config.js は変更不要です。
