# spatial_id_viewer ドキュメント

## 空間IDビューアー

Cesium ベースのビューアーアプリケーションです。

* [ビューアーのビルド方法](../packages/spatial-id-viewer/README.md)
* [内部バリアビューアーのビルド方法](../packages/spatial-id-viewer-internal/README.md)

## ライブラリ

ビューアーアプリケーションを独自に開発する際等の利用を想定した、上記ビューアーの機能を切り出したライブラリです。

以下のライブラリを用意しています:

| ライブラリ名                                                                              | 機能                                                                               |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [spatial-id-converter](../packages/spatial-id-converter)                                  | 空間 ID を Cesium で読み込み可能な 3D モデルに変換、日本付近のジオイド高の取得など |
| [spatial-id-converter-internal](../packages/spatial-id-converter-internal) (内部用)       | 内部バリアを spatial-id-converter が読み込めるよう変換                             |
| [spatial-id-svc-base](../packages/spatial-id-svc-base)                                    | 各種 REST API ラッパーの共通部分、共通エラークラスなど                             |
| [spatial-id-svc-common](../packages/spatial-id-svc-common)                                | REST API トークン取得、共通インターフェース定義など                                |
| [spatial-id-svc-area](../packages/spatial-id-svc-area)                                    | area service の REST API ラッパー                                                  |
| [spatial-id-svc-route](../packages/spatial-id-svc-route)                                  | route service の REST API ラッパー                                                 |
| [spatial-id-svc-barriers-internal](../packages/spatial-id-svc-barriers-internal) (内部用) | search path の REST API ラッパー                                                   |

* [ライブラリのビルド方法](./how-to-build-libraries.md)
* [ライブラリの使用方法](./how-to-use-libraries.md)
* [ライブラリを使用したサンプルプロジェクト](../examples)
