/**
 * ============================================================
 *  X運用ヒアリングシート — Google Apps Script
 *  株式会社SNSの右腕
 * ============================================================
 *
 *  【セットアップ手順】
 *
 *  1. Googleスプレッドシートを新規作成する
 *     - シート1行目にヘッダーを入れておく（自動で書き込まれるが推奨）:
 *       タイムスタンプ | 会社名 | 担当者名 | メールアドレス |
 *       サービスURL | Xアカウント | その他SNS | 競合企業 |
 *       運用目的 | 商品・サービス | ターゲット |
 *       SNS運用経験 | 希望時期 | 予算感 | NGトピック | 備考
 *
 *  2. スプレッドシートのメニュー「拡張機能 → Apps Script」を開く
 *
 *  3. エディタにこのファイルの内容をすべて貼り付ける
 *
 *  4. 下記の定数を自分の環境に合わせて書き換える
 *     - SPREADSHEET_ID : スプレッドシートのURLに含まれるID
 *       （https://docs.google.com/spreadsheets/d/★ここ★/edit）
 *     - SHEET_NAME : 書き込み先のシート名（デフォルト: シート1）
 *     - SLACK_WEBHOOK_URL : Slack Incoming Webhook URL
 *       （https://hooks.slack.com/services/XXXX/YYYY/ZZZZ）
 *
 *  5. メニュー「デプロイ → 新しいデプロイ」を選択
 *     - 種類: 「ウェブアプリ」
 *     - 実行ユーザー: 「自分」
 *     - アクセス: 「全員」
 *     → デプロイ後に表示されるURLをコピー
 *
 *  6. index.html 内の GAS_URL にコピーしたURLを貼り付ける
 *
 *  7. index.html をホスティングする
 *     （Netlify / Vercel / GitHub Pages など）
 *
 * ============================================================
 */

// ★ 書き換え必須 ★
var SPREADSHEET_ID    = 'YOUR_SPREADSHEET_ID';
var SHEET_NAME        = 'シート1';
var SLACK_WEBHOOK_URL = 'YOUR_SLACK_WEBHOOK_URL';

// ─────────────────────────────────────────────
//  POST リクエスト受信
// ─────────────────────────────────────────────
function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid JSON' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  writeToSheet(data);
  notifySlack(data);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────
//  Google Sheets 書き込み
// ─────────────────────────────────────────────
function writeToSheet(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  sheet.appendRow([
    new Date(),                // タイムスタンプ
    data.companyName  || '',   // 会社名
    data.contactName  || '',   // 担当者名
    data.email        || '',   // メールアドレス
    data.serviceUrl   || '',   // サービスURL
    data.xAccount     || '',   // Xアカウント
    data.otherSns     || '',   // その他SNS
    data.competitors  || '',   // 競合企業
    data.purpose      || '',   // 運用目的
    data.product      || '',   // 商品・サービス
    data.target       || '',   // ターゲット
    data.experience   || '',   // SNS運用経験
    data.timeline     || '',   // 希望時期
    data.budget       || '',   // 予算感
    data.ngTopics     || '',   // NGトピック
    data.remarks      || ''    // 備考
  ]);
}

// ─────────────────────────────────────────────
//  Slack 通知
// ─────────────────────────────────────────────
function notifySlack(data) {
  var lines = [
    ':memo: *X運用ヒアリング 新規回答*',
    '',
    '*会社名:* ' + (data.companyName || '—'),
    '*担当者:* ' + (data.contactName || '—'),
    '*メール:* ' + (data.email || '—'),
    '',
    '───── 調査情報 ─────',
    '*サービスURL:* ' + (data.serviceUrl || '—'),
    '*Xアカウント:* ' + (data.xAccount || '—'),
    '*その他SNS:* ' + (data.otherSns || '—'),
    '*競合企業:* ' + (data.competitors || '—'),
    '',
    '───── 方向性 ─────',
    '*運用目的:* ' + (data.purpose || '—'),
    '*商品・サービス:* ' + (data.product || '—'),
    '*ターゲット:* ' + (data.target || '—'),
    '',
    '───── 温度感 ─────',
    '*SNS運用経験:* ' + (data.experience || '—'),
    '*希望時期:* ' + (data.timeline || '—'),
    '*予算感:* ' + (data.budget || '—'),
    '',
    '───── その他 ─────',
    '*NGトピック:* ' + (data.ngTopics || '—'),
    '*備考:* ' + (data.remarks || '—')
  ];

  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text: lines.join('\n') })
  });
}
