[简体中文](https://github.com/haierkeys/obsidian-custom-image-auto-uploader/blob/master/docs/README.zh-CN.md) / [English](https://github.com/haierkeys/obsidian-custom-image-auto-uploader/blob/master/README.md) / [日本語](https://github.com/haierkeys/obsidian-custom-image-auto-uploader/blob/master/docs/README.ja.md) / [한국어](https://github.com/haierkeys/obsidian-custom-image-auto-uploader/blob/master/docs/README.ko.md) / [繁體中文](https://github.com/haierkeys/obsidian-custom-image-auto-uploader/blob/master/docs/README.zh-TW.md)


ご不明な点がございましたら、新しい [issue](https://github.com/haierkeys/obsidian-custom-image-auto-uploader/issues/new) を作成するか、Telegram グループに参加して助けを求めてください: [https://t.me/obsidian_users](https://t.me/obsidian_users)



<h1 align="center">Obsidian Custom Image Auto Uploader</h1>

<p align="center">
    <a href="https://github.com/haierkeys/obsidian-custom-image-auto-uploader/releases"><img src="https://img.shields.io/github/release/haierkeys/obsidian-custom-image-auto-uploader?style=flat-square" alt="release"></a>
    <a href="https://github.com/haierkeys/obsidian-custom-image-auto-uploader/blob/master/LICENSE"><img src="https://img.shields.io/github/license/haierkeys/obsidian-custom-image-auto-uploader?style=flat-square" alt="license"></a>
</p>

<p align="center">
  <strong>Obsidian ノート画像の一括クラウド同期および処理プラグイン</strong>
  <br>
  <em>一括ダウンロード / アップロード / 切り抜き / 圧縮 / 多様な画像ホスティングに対応</em>
</p>

<p align="center">
PCやモバイルデバイスからノート内の画像を一括ダウンロードしたり、リモートサーバー、家庭用NAS、WebDAV、またはクラウドストレージ（Aliyun OSS、Amazon S3、Cloudflare R2、MinIO）に一括アップロードして保存したりすることができます。また、画像の拡大縮小、切り抜き、サイズ変更も可能です。
</p>

<div align="center">
    <img src="https://github.com/user-attachments/assets/0878061b-d77c-48c5-aa61-cc5154612a7b" alt="preview" width="800" />
</div>

---

## ✨ 主な機能

* **⬇️ 一括ダウンロード**: ノート内のウェブ画像をワンクリックでローカルにダウンロード。
* **⬇️ 複数ノートの一括ダウンロード**: ヴォールト内のすべてのノートから画像を一括でダウンロード可能。
* **☁️ 一括アップロード**: ローカル画像をリモートサービスにアップロードし、多様なストレージバックエンドをサポート：
    * **セルフホストサービス**: [Custom Image Gateway](https://github.com/haierkeys/custom-image-gateway) と連携して使用。
    * **クラウドストレージ**: Aliyun OSS, Amazon S3, Cloudflare R2, MinIO など。
    * **汎用プロトコル**: WebDAV, リモートサーバー, 家庭用NAS。
* **☁️ 複数ノートの一括アップロード**: ヴォールト内のすべてのノートから画像を一括でアップロード可能。
* **✂️ 画像処理**: ノートのプロパティや本文で画像を即座に処理（ブログのカバー画像など）：
    * 等倍左上塗りつぶし (Cover)
    * 等倍中央塗りつぶし (Contain)
    * 固定サイズ引き伸ばし (Stretch)
    * 等倍フィット (Fit)
* **📱 全プラットフォーム対応**: Windows, MacOS, Linux, Android, iOS。
* **🖱️ 便利な操作**: ドラッグ＆ドロップ、貼り付けによる自動アップロードに対応。
* **🌍 多言語対応**: 多言語パックを内蔵。
* **🗑️ 未接続画像のクリーンアップ**: ノートに関連付けられていないヴォールト内のローカル画像をワンクリックで削除。

## 🗺️ ロードマップ

継続的な改善を行っています。今後の開発計画は以下の通りです：

- [x] **未接続画像のクリーンアップ**: ノートに関連付けられていないヴォールト内のローカル画像をワンクリックで削除。

> **改善の提案や新しいアイデアがある場合は、issue を通じてお気軽にお知らせください。適切な提案は慎重に評価し、採用させていただきます。**

## 🚀 クイックスタート

1.  **プラグインのインストール**
    Obsidian のコミュニティプラグイン市場で **Custom Image Auto Uploader** を検索してインストールします。

2.  **ゲートウェイの設定 (任意)**
    セルフホストの画像ホストを使用する場合は、**アップロード設定** > **API ゲートウェイアドレス** をあなたの **Custom Image Gateway** のアドレスに設定してください。
    > 例: `http://127.0.0.1:9000/api/upload`

3.  **認証の設定**
    セキュリティを確保するために **API アクセストークン** (Token) を設定します。

4.  **サービスの起動**
    リモートの **Custom Image Gateway** サービスが起動しており、アクセス可能であることを確認します。

5.  **検証**
    新しいノートを作成し、画像をコピーして貼り付け、アップロードが成功するか確認します。

## ⚙️ バックエンドサービス (API ゲートウェイ)

このプラグインの高度な機能には **Custom Image Gateway** の使用が必要です。

> **Custom Image Gateway** は、無料かつオープンソースの画像アップロードゲートウェイツールです。

*   **プロジェクトアドレス**: [haierkeys/custom-image-gateway](https://github.com/haierkeys/custom-image-gateway)
*   **デプロイメントドキュメント**: プロジェクトのホームページを参照してデプロイしてください。

## ☕ スポンサーとサポート

このプラグインが役に立ち、開発を継続的にサポートしたい場合は、コーヒーを一杯ご馳走していただけると幸いです：

[<img src="https://cdn.ko-fi.com/cdn/kofi3.png?v=3" alt="BuyMeACoffee" width="100">](https://ko-fi.com/haierkeys)
