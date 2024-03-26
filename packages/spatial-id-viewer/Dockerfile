FROM node:19.6.0-bullseye AS packages

# 依存モジュールのインストール時に必要なファイルのみを取り出す
WORKDIR /app/
RUN --mount=type=bind,target=/docker-context \
  cd /docker-context/ \
  && cp -r .yarn .yarnrc.yml yarn.lock /app \
  && find . -mindepth 0 -maxdepth 4 -name "package.json" -exec cp --parents "{}" /app/ \;

# --------------------------------

FROM node:19.6.0-bullseye AS build

WORKDIR /app
COPY --from=packages /app .

# 依存関係をインストール
RUN yarn

# ビルド
COPY . .
WORKDIR /app/packages/spatial-id-viewer
RUN yarn build && yarn export

# ダイナミックルーティングに必要なファイルのみに絞る
WORKDIR /app/packages/spatial-id-viewer/out
RUN find -maxdepth 1 -name '*.html' -and -not -name '_redirect.html' -type f -delete
RUN find -maxdepth 1 -not -name '.' -and -not -name '..' -and -not -name '_next' -and -not -name 'static' -type d -exec rm -rf '{}' +

# --------------------------------

FROM nginx:stable-alpine

# ビルドした静的ファイルをコピー
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/packages/spatial-id-viewer/out /usr/share/nginx/html

# ダイナミックルーティング用設定ファイルをコピー
ADD deployment/nginx.conf.d/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
