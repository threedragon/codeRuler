# Code Ruler

## 概要
隠された複数の条件を満たす3～6桁の数字パスワードを当てるゲームです。
Neutralino.jsを用いてローカルで動作します。

## 使い方

### 起動
1. Neutralino.jsの環境で `neutralino run` などで起動
2. アプリが立ち上がると、最初にルール説明パネルが表示されます（クリックで閉じる）
3. 起動直後はランダムモードで問題が出題されます

### モード切替
- 画面右上の「📖」ボタン：ファイルから問題を選択
- 画面右上の「🎲」ボタン：ランダム条件で出題

### 入力・判定
- テンキーまたはキーボードで3～6桁の数字を入力
- 「決定」ボタンで判定、条件ごとに✔️/❌表示
- 条件をすべて満たすと「パスワードOK!」と表示
- 「次の問題へ」ボタンで次の問題または新たなランダム問題

### ファイル構成
- `resources/index.html` ... UI本体
- `resources/main.js` ... UIロジック・イベント
- `resources/condcheck.js` ... 条件定義・判定ロジック
- `resources/problems_loader.js` ... 問題セット読込・選択UI
- `resources/problems.json` ... 問題セット
- `resources/style.css` ... スタイル
- `neutralino.config.json` ... Neutralino設定

## 注意
- Neutralino.js v4以降はファイルパスやdocumentRootの設定に注意してください。
- `problems.json`は`/resources/`直下に配置してください。

## ライセンス
MIT
