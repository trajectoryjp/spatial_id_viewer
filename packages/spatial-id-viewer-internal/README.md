# spatial-id-viewer-internal

内部バリア用 GUI クライアント本体の実装。

## ビルド・デプロイ手順

### ビルド環境・デプロイ環境の要件

* Docker
* Docker Compose v2 以降
* コンテナレジストリへアクセス可能な環境
  * ECR の場合、amazon-ecr-credential-helper・認証情報等が必要


### 準備

#### ビルド環境

* このディレクトリに移動します。
* .env.example ファイルをコピーして .env ファイルを作成します。
* .env 内の NEXT_PUBLIC_API_BASE_URL の設定を書き換えます。開発環境での例は次の通りです。

```sh
# API サーバの URL
NEXT_PUBLIC_API_BASE_URL=https://trjxdev.trajectory.jp
```


#### デプロイ環境

（開発環境においては、~/spid_internal_view-dev にすでに用意済）

* 任意にディレクトリを作成します。以下、このディレクトリ内で作業します。
* このディレクトリ内の docker-compose.yml を配置・編集します。デプロイ環境にはリポジトリ自体は必要なく、編集したこのファイルのみの配置で問題ありません。
* yaml 内の image の値を、コンテナレジストリのものに書き換えます。以下開発環境での例となります。

```yaml
image: 531630878474.dkr.ecr.ap-northeast-1.amazonaws.com/spid_internal_view:dev-latest
```

* HTTP サーバに割り当てるポート番号を yaml の ports に記載します。

```yaml
ports:
  - '8080:8080' # コロンの左側を書き換える
```


### イメージのビルド

* このディレクトリ内で、`docker compose build` を実行します。
  * イメージ spatial-id-viewer-internal:latest がローカルの Docker に登録されます。
  * ビルド時に .env の設定が取り込まれるため、環境ごとにイメージをビルドし直す必要があります。


### イメージのプッシュ

* ビルド済みのイメージに、push 先に合わせたイメージ名（タグ）を付与します。以下開発環境の例となります。

```sh
docker tag \
  spatial-id-viewer-internal:latest \
  531630878474.dkr.ecr.ap-northeast-1.amazonaws.com/spid_internal_view:dev-latest
```

* コンテナレジストリに push します。

```sh
docker push \
  531630878474.dkr.ecr.ap-northeast-1.amazonaws.com/spid_internal_view:dev-latest
```

### コンテナのデプロイ

* デプロイ環境の docker-compose.yml が配置済みのディレクトリで次の手順を行います。

```sh
# イメージの取得
docker compose pull

# コンテナを作成して実行、または実行中のコンテナを差し替える
docker compose up -d
```

* 正常に起動していれば、yaml に記載のポート番号で HTTP サーバが動作しています。
