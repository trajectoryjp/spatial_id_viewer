# Spatial ID Viewer - Docker Compose セットアップ

このフォルダには、**Spatial ID Viewer** アプリケーションを実行するための **Docker Compose** 設定のサンプルが含まれています。このセットアップには、**モックバックエンドサーバー** と **フロントエンドサービス** の両方が含まれており、開発およびテストのための完全な環境を提供します。

## 📌 前提条件

アプリケーションを実行する前に、以下がインストールされていることを確認してください。

- [Docker](https://docs.docker.com/get-docker/) - コンテナ化された実行環境に必要。
- [Docker Compose](https://docs.docker.com/compose/install/) - 複数のサービスをオーケストレーションするために必要。

## 🚀 実行方法

以下の手順に従って、Spatial ID Viewer アプリケーションを起動してください。

1. **ターミナルを開き**、`docker-compose.yml` ファイルがあるフォルダに移動します。

   ```sh
   cd public-viewer-compose
   ```

2. **Docker Compose を使用してサービスを起動** します。

   ```sh
   docker-compose up
   ```

   これにより、必要なイメージがダウンロードされ（未取得の場合）、必要なコンテナが起動します。

3. **ウェブブラウザでアプリケーションにアクセス** します。

   - 🌐 開く: [http://localhost:4200](http://localhost:4200)

4. **ログイン時の認証情報**
   - ログインが求められた場合、任意のユーザー名とパスワードを入力できます。

## 🔄 サービスの停止

実行中のコンテナを停止するには、サービスが実行されているターミナルで `Ctrl + C` を押します。または、以下のコマンドを使用できます。

```sh
docker-compose down
```

このコマンドは、すべての関連コンテナを停止し削除します。

## 📂 フォルダ構成

```
public-viewer-compose/
│── docker-compose.yml  # Docker Compose 設定ファイル
```

## 🛠 トラブルシューティング

- コンテナが起動しない場合は、以下を試してください。
  ```sh
  docker-compose up --build
  ```
  これにより、イメージの再ビルドを強制してからサービスを起動します。
- **ポート 4200** が他のアプリケーションで使用されていないことを確認してください。
- `docker ps` を実行して、必要なコンテナが実行されているか確認してください。

## 🏗️ ローカルで Docker イメージをビルドする方法

1. ターミナルを開き、プロジェクトディレクトリに移動  
   まず、プロジェクトのルートフォルダでターミナルを開き、`spatial-id-viewer` フォルダに移動します。

   ```sh
   cd packages/spatial-id-viewer
   ```

2. 環境変数ファイルを作成  
   `.env.local` ファイルを作成し、`.env.example` の内容をコピーして貼り付けます。  
   その後、`NEXT_PUBLIC_API_BASE_URL` を必要なバックエンド の URL に設定します。

3. Docker イメージをビルド & 起動  
   以下のコマンドを実行し、Docker イメージをビルドしてコンテナを起動します。

   ```sh
   docker-compose up --build
   ```

4. アプリケーションにアクセス  
   ウェブブラウザを開き、以下の URL にアクセスしてください。

   🌐 [http://localhost:8080](http://localhost:8080)

5. サービスを停止する方法  
   実行中のコンテナを停止するには、以下のいずれかの方法を使用できます。

   - ターミナルで **`Ctrl + C`** を押す
   - 以下のコマンドを実行する

   ```sh
   docker-compose down
   ```

💡 さらにサポートが必要ですか？[Docker ドキュメント](https://docs.docker.com/) をチェックするか、問題を報告してください。楽しいコーディングを！ 🚀
