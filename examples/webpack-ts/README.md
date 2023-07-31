# webpack サンプル

npm モジュール + Webpack + TypeScript の構成のサンプルプロジェクト。

※ trjxdev 環境に接続するよう設定しております。必要に応じ src/index.ts の書き換え・再ビルドを行ってください。

## ビルド方法

再ビルドを行う際は次の手順を使用します。

### 動作環境

* UNIX 系環境 (Linux, macOS, WSL2 等)
* Node.js
* Yarn

### コマンド

```sh
# 依存ライブラリを取得する (package.json に記載のあるライブラリの自動取得)
yarn

# dist/index.bundle.js のビルドを行う
yarn build
```
