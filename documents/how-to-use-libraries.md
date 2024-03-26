# ライブラリの使用方法

## プロジェクトの作成例

### yarn プロジェクトを作成・TypeScript・Webpack を使用

型定義に沿いながら記述できるため、この構成を推奨します。

* 任意のディレクトリに yarn プロジェクトを作成します。

```sh
yarn init
yarn set version stable
echo "nodeLinker: node-modules" >> .yarnrc.yml
```

* Webpack, TypeScript 関連モジュールをインストールします。

```sh
yarn add -D typescript webpack ts-loader
```

* ライブラリをインストールします。git submodule としてこのリポジトリを埋め込み、相対パスで指定することで、全開発者間でパスを共有できます。
  * （注: npm モジュール公開後はこの手順が変更になります）

```sh
# すべてのモジュールをインストールする例
yarn add \
  spatial-id-converter@file:[このリポジトリのパス]/packages/spatial-id-converter/dist \
  spatial-id-svc-area@file:[このリポジトリのパス]/packages/spatial-id-svc-area/dist \
  spatial-id-svc-base@file:[このリポジトリのパス]/packages/spatial-id-svc-base/dist \
  spatial-id-svc-common@file:[このリポジトリのパス]/packages/spatial-id-svc-common/dist \
  spatial-id-svc-route@file:[このリポジトリのパス]/packages/spatial-id-svc-route/dist
```

* Webpack の設定 (webpack.config.js)、TypeScript の設定 (tsconfig.json) 等を[サンプルプロジェクト](../examples/webpack-ts/)のように記述します。

* package.json の scripts も同様に、サンプルプロジェクトのように記述します。

* src/index.ts を作成し、ソースを記述します。

* ビルドの際は、サンプルプロジェクトと同様に、`yarn build` を使用します。
  * ビルドが終了すると、`dist/index.bundle.js` が生成されます。これを HTML から読み込んでください。


### JavaScript を直接記述・ブラウザーからライブラリを直に読み込み

ビルド済みライブラリをそのままブラウザーで使用します。この構成では、プロジェクトとしてのビルドは必要ありませんが、TypeScript の型定義等の支援は利用できません。

[サンプルプロジェクト](../examples/use-directly/)の index.html, index.js のように実装を行ってください。


## サンプルプロジェクトの実行

※ サンプルプロジェクトは、trjxdev 環境に接続するよう設定しております。必要に応じ書き換え・再ビルドを行ってください。

* このリポジトリのルートで `yarn` (依存ライブラリのインストール) を実行します。
* このリポジトリのルートで、`yarn examples` を実行します。
* ブラウザーで、http://localhost:8080/examples/ にアクセスします。


## ライブラリ仕様

インターフェース定義は、各ライブラリの .d.ts ファイル (ライブラリ型定義ファイル) や REST API 仕様書、.proto ファイル等を参照してください。

.d.ts ファイルのパスへのリンクを示します:

* [spatial-id-converter](../packages/spatial-id-converter/dist/index.d.ts)
dist/index.d.ts)
* [spatial-id-svc-base](../packages/spatial-id-svc-base/dist/index.d.ts)
* [spatial-id-svc-common](../packages/spatial-id-svc-common/dist/index.d.ts)
* [spatial-id-svc-area](../packages/spatial-id-svc-area/dist/index.d.ts)
* [spatial-id-svc-route](../packages/spatial-id-svc-route/dist/index.d.ts)

また、具体的な呼び出し方の一例はサンプルプロジェクト ([Webpack 向け](../examples/webpack-ts/), [直接利用向け](../examples/use-directly/)) を参照してください。


### ライブラリ間の依存関係

ライブラリ間にも依存関係があり、使用の際はそれらの依存関係を満たすようにインストールや配置等する必要があります。現在の依存関係は次のとおりです:

| ライブラリ                                | 依存先                                     |
| ----------------------------------------- | ------------------------------------------ |
| spatial-id-converter                      | なし                                       |
| spatial-id-svc-base                       | なし                                       |
| spatial-id-svc-common                     | spatial-id-svc-base                        |
| spatial-id-svc-area                       | spatial-id-svc-base, spatial-id-svc-common |
| spatial-id-svc-route                      | spatial-id-svc-base, spatial-id-svc-common |
