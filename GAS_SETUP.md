# Google Apps Script 設定手順

フォームに入力された情報をスプレッドシートに記録し、指定のメールアドレスに通知を送るための設定手順です。

## 1. スプレッドシートの準備
1. 指定されたスプレッドシート（ https://docs.google.com/spreadsheets/d/1f52l64IfwrrjWB5W1B_K1LzeRxY8Dix_i3qbfw9afjE/edit ）を開きます。
2. 1行目にヘッダー行を作成してください。
   - A1: `タイムスタンプ`
   - B1: `会社名`
   - C1: `氏名`
   - D1: `メールアドレス`
   - E1: `役職・職種`
   - F1: `正答数`
   - G1: `正答率`
   - H1: `段位`

## 2. Apps Script の作成
1. スプレッドシートのメニューから「拡張機能」＞「Apps Script」をクリックします。
2. 開いたエディタの既存のコードをすべて消し、以下のコードを貼り付けます。

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const params = e.parameter;
    
    // 現在の日時
    const timestamp = new Date();
    
    // スプレッドシートへの書き込み
    sheet.appendRow([
      timestamp,
      params.company || '',
      params.name || '',
      params.email || '',
      params.job || '',
      params.score || '',
      params.percent ? params.percent + '%' : '',
      params.rank || ''
    ]);
    
    // メール送信設定
    const emailAddress = 'koji.kobayashi@nodia.co.jp';
    const subject = '人事テスト受講通知';
    const body = `
人事テストが受験されました。

【受講者情報】
会社名: ${params.company || '未入力'}
氏名: ${params.name || '未入力'}
メールアドレス: ${params.email || '未入力'}
役職・職種: ${params.job || '未入力'}

【結果】
正答数: ${params.score || 0}
正答率: ${params.percent || 0}%
段位: ${params.rank || '未判定'}
    `;
    
    MailApp.sendEmail(emailAddress, subject, body);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 3. Webアプリとしてデプロイ
1. エディタ右上の青いボタン「デプロイ」＞「新しいデプロイ」をクリックします。
2. 「種類の選択」の歯車アイコンから「ウェブアプリ」を選択します。
3. 以下の設定にします。
   - 説明: `任意の名前（例：人事テスト連携）`
   - 実行するユーザー: `自分（あなたのアカウント）`
   - アクセスできるユーザー: `全員`
4. 「デプロイ」をクリックします。（※初回はアクセス承認が求められるので、画面の指示に従い許可してください）
5. 表示された「**ウェブアプリのURL**」（`https://script.google.com/macros/s/.../exec`）をコピーします。

## 4. game.js に URL を設定
`game.js` の `postToGoogleAppsScript()` 関数内にある `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL` という文字列を、先ほどコピーしたURLに置き換えて保存してください。

これで設定は完了です。
