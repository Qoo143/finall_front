# QianTa 電商系統 - 前端

> 📖 [返回專案總覽](https://github.com/Qoo143/QianTa) 

基於 Vue 3 + TypeScript 的現代化電商前端應用，實現前後台分離的用戶界面。

## 🔗 相關連結
- **🏠 [專案總覽](https://github.com/Qoo143/QianTa)** - 完整專案說明
- **⚙️ [後端專案](https://github.com/Qoo143/finall_back)** - API 服務

## ⚡ 快速開始

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建置生產版本
npm run build
```

## 🛠 技術棧

- **Vue 3** - Composition API + `<script setup>`
- **TypeScript** - 型別安全
- **Pinia** - 狀態管理
- **Vue Router** - 路由管理
- **Element Plus** - UI 組件庫
- **GSAP** - 動畫效果
- **Google Model Viewer** - 3D 展示

## 📁 專案結構

```
src/
├── components/          # 通用組件
├── views/              # 頁面組件
│   ├── home/           # 前台頁面
│   ├── products/       # 後台管理
│   └── login/          # 登入註冊
├── stores/             # Pinia 狀態
├── api/                # API 請求
├── utils/              # 工具函數
└── types/              # 型別定義
```

## ✨ 核心功能

### 前台功能
- 🛍️ 商品瀏覽與搜索
- 🛒 購物車管理
- 📦 訂單下單與查詢
- 🎭 3D 商品展示
- ✨ GSAP 滾動動畫

### 後台管理
- 📊 商品管理（CRUD）
- 🏷️ 分類標籤管理
- 📸 圖片與 3D 模型上傳
- 👥 權限控制

## 🎨 特色亮點

- **響應式設計**：適配各種螢幕尺寸
- **狀態持久化**：購物車跨頁面同步
- **動畫體驗**：首頁滾動視差效果
- **3D 展示**：商品立體預覽
- **類型安全**：TypeScript 完整覆蓋

---

> 💡 更多技術細節請參考 [專案總覽文件](https://github.com/Qoo143/QianTa)
