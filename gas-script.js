/**
 * ============================================================
 *  X運用ヒアリングシート — Google Apps Script
 *  株式会社SNSの右腕
 * ============================================================
 *
 *  【セットアップ手順】
 *
 *  1. Googleスプレッドシートを新規作成する
 *     - シート1行目にヘッダーを入れておく（推奨）:
 *       タイムスタンプ | 会社名 | 担当者名 | メールアドレス |
 *       事業内容 | 従業員数 | サービスURL | Xアカウント |
 *       その他SNS | 競合企業 | 運用目的 | 商品・サービス |
 *       ターゲット | X運用経験 | 課題 | 相談内容 |
 *       サービス紹介 | 希望時期 | 予算 | 備考
 *
 *  2. スプレッドシートのメニュー「拡張機能 → Apps Script」を開く
 *
 *  3. エディタにこのファイルの内容をすべて貼り付ける
 *
 *  4. 下記の定数を自分の環境に合わせて書き換える
 *     - SPREADSHEET_ID : スプレッドシートのURLに含まれるID
 *     - SHEET_NAME : 書き込み先のシート名（デフォルト: シート1）
 *     - SLACK_WEBHOOK_URL : Slack Incoming Webhook URL
 *
 *  5. メニュー「デプロイ → 新しいデプロイ」を選択
 *     - 種類: 「ウェブアプリ」
 *     - 実行ユーザー: 「自分」
 *     - アクセス: 「全員」
 *     → デプロイ後に表示されるURLをコピー
 *
 *  6. index.html 内の GAS_URL にコピーしたURLを貼り付ける
 *
 * ============================================================
 */

// ★ 書き換え必須 ★
var SPREADSHEET_ID    = 'YOUR_SPREADSHEET_ID';
var SHEET_NAME        = 'シート1';
var SLACK_WEBHOOK_URL = 'YOUR_SLACK_WEBHOOK_URL';

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

function writeToSheet(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  sheet.appendRow([
    new Date(),
    data.companyName   || '',
    data.contactName   || '',
    data.email         || '',
    data.business      || '',
    data.employees     || '',
    data.serviceUrl    || '',
    data.xAccount      || '',
    data.otherSns      || '',
    data.competitors   || '',
    data.purpose       || '',
    data.product       || '',
    data.target        || '',
    data.experience    || '',
    data.challenges    || '',
    data.consultation  || '',
    data.serviceIntro  || '',
    data.timeline      || '',
    data.budget        || '',
    data.remarks       || ''
  ]);
}

function notifySlack(data) {
  var lines = [
    ':memo: *X運用ヒアリング 新規回答*',
    '',
    '*会社名:* ' + (data.companyName || '—'),
    '*担当者:* ' + (data.contactName || '—'),
    '*メール:* ' + (data.email || '—'),
    '*事業内容:* ' + (data.business || '—'),
    '*従業員数:* ' + (data.employees || '—'),
    '',
    '*サービスURL:* ' + (data.serviceUrl || '—'),
    '*Xアカウント:* ' + (data.xAccount || '—'),
    '*その他SNS:* ' + (data.otherSns || '—'),
    '*競合企業:* ' + (data.competitors || '—'),
    '',
    '*運用目的:* ' + (data.purpose || '—'),
    '*商品・サービス:* ' + (data.product || '—'),
    '*ターゲット:* ' + (data.target || '—'),
    '',
    '*X運用経験:* ' + (data.experience || '—'),
    '*現在の課題:* ' + (data.challenges || '—'),
    '*当日の相談内容:* ' + (data.consultation || '—'),
    '',
    '*サービス紹介:* ' + (data.serviceIntro || '—'),
    '*希望時期:* ' + (data.timeline || '—'),
    '*月間予算:* ' + (data.budget || '—'),
    '',
    '*備考:* ' + (data.remarks || '—')
  ];

  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text: lines.join('\n') })
  });
}
