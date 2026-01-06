[简体中文](https://github.com/haierkeys/obsidian-custom-image-auto-uploader/blob/master/docs/README.zh-CN.md) / [English](https://github.com/haierkeys/obsidian-custom-image-auto-uploader/blob/master/README.md) / [日本語](https://github.com/haierkeys/obsidian-custom-image-auto-uploader/blob/master/docs/README.ja.md) / [한국어](https://github.com/haierkeys/obsidian-custom-image-auto-uploader/blob/master/docs/README.ko.md) / [繁體中文](https://github.com/haierkeys/obsidian-custom-image-auto-uploader/blob/master/docs/README.zh-TW.md)


有問題請新建 [issue](https://github.com/haierkeys/obsidian-custom-image-auto-uploader/issues/new) , 或加入電報交流群尋求幫助: [https://t.me/obsidian_users](https://t.me/obsidian_users)



<h1 align="center">Obsidian Custom Image Auto Uploader</h1>

<p align="center">
    <a href="https://github.com/haierkeys/obsidian-custom-image-auto-uploader/releases"><img src="https://img.shields.io/github/release/haierkeys/obsidian-custom-image-auto-uploader?style=flat-square" alt="release"></a>
    <a href="https://github.com/haierkeys/obsidian-custom-image-auto-uploader/blob/master/LICENSE"><img src="https://img.shields.io/github/license/haierkeys/obsidian-custom-image-auto-uploader?style=flat-square" alt="license"></a>
</p>

<p align="center">
  <strong>Obsidian 筆記圖片一鍵雲端同步與處理插件</strong>
  <br>
  <em>支持 批量下載 / 上傳 / 裁剪 / 壓縮 / 多圖床支持</em>
</p>

<p align="center">
您可以在 電腦和手機 端上將筆記中的圖片批量下載, 批量上傳保存到遠端服務器、家庭 NAS、WebDAV 或者雲存儲上（阿里雲 OSS 、亞馬遜 S3 、Cloudflare R2 、MinIO ），並且您還可以對圖片進行拉伸裁剪以及修改尺寸。
</p>

<div align="center">
    <img src="https://github.com/user-attachments/assets/0878061b-d77c-48c5-aa61-cc5154612a7b" alt="preview" width="800" />
</div>

---

## ✨ 核心功能

* **⬇️ 批量下載**：一鍵將筆記內的網絡圖片下載至本地。
* **⬇️ 多筆記批量下載**：可以一鍵下載整個筆記倉庫所有筆記中的圖片。
* **☁️ 批量上傳**：將本地圖片上傳至遠端服務，支持多種存儲後端：
    * **自建服務**：配合 [Custom Image Gateway](https://github.com/haierkeys/custom-image-gateway) 使用。
    * **雲存儲**：阿里雲 OSS, Amazon S3, Cloudflare R2, MinIO 等。
    * **通用協議**：WebDAV, 遠端服務器, 家庭 NAS。
* **☁️ 多筆記批量上傳**：可以一鍵上傳整個筆記倉庫所有筆記中的圖片。
* **✂️ 圖片處理**：支持在筆記屬性或正文中即時處理圖片（如博客封面圖）：
    * 等比左上填充 (Cover)
    * 等比居中填充 (Contain)
    * 固定尺寸拉伸 (Stretch)
    * 等比適應 (Fit)
* **📱 全平台支持**：Windows, MacOS, Linux, Android, iOS。
* **🖱️ 便捷操作**：支持拖拽, 粘貼自動上傳。
* **🌍 多語言支持**：內置多國語言包。
* **🗑️ 清理未連接圖片**：可以一鍵清理筆記倉庫中未和筆記連接的本地圖片。

## 🗺️ 路線圖 (Roadmap)

我們正在持續改進，以下是未來的開發計劃：

- [x] **清理未連接圖片**：可以一鍵清理筆記倉庫中未和筆記連接的本地圖片。

> **如果您有改進建議或新想法，歡迎通過提交 issue 與我們分享——我們會認真評估並採納合適的建議。**

## 🚀 快速開始

1.  **安裝插件**
    打開 Obsidian 社區插件市場，搜索 **Custom Image Auto Uploader** 並安裝。

2.  **配置網關 (可選)**
    若使用自建圖床，請將 **上傳設置** > **API 網關地址** 設置為您的 **Custom Image Gateway** 地址。
    > 例如: `http://127.0.0.1:9000/api/upload`

3.  **配置鑒權**
    設置 **API 訪問令牌** (Token) 以確保安全。

4.  **啟動服務**
    確保遠端 **Custom Image Gateway** 服務已啟動並可訪問。

5.  **驗證**
    創建一個新筆記，複製圖片進去，檢查是否上傳成功。

## ⚙️ 後端服務 (API 網關)

本插件的高級功能需要配合 **Custom Image Gateway** 使用。

> **Custom Image Gateway** 是一個免費開源的圖片上傳網關工具。

*   **項目地址**: [haierkeys/custom-image-gateway](https://github.com/haierkeys/custom-image-gateway)
*   **部署文檔**: 請參考項目主頁進行部署。

## ☕ 贊助與支持

如果覺得這個插件很有用，並且想要支持它的繼續開發，歡迎請我喝杯咖啡：

[<img src="https://cdn.ko-fi.com/cdn/kofi3.png?v=3" alt="BuyMeACoffee" width="100">](https://ko-fi.com/haierkeys)
