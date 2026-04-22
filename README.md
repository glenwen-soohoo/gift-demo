# 贈品系統 Demo

React + antd 獨立 demo，展示贈品系統的兩個狀態機：

- **狀態機 A（後台）**：贈品規則生命週期 — 草稿 → 上架中 ⇄ 暫停 → 下架 / 已過期 / 已耗盡
- **狀態機 B（前台）**：購物車贈品運行時 — 未觸發 → 快達門檻 → 已自動加入 ⇄ 客人拒絕 → 已結帳

## 快速開始

```bash
npm install
npm run dev
```

打開瀏覽器 http://localhost:5173/gift-demo/

## 頁面一覽

- `/` — 首頁（選擇進入前台 / 後台）
- `/admin/gifts` — 後台贈品規則列表
- `/admin/gifts/new` — 新增贈品規則
- `/admin/gifts/:id` — 編輯贈品規則
- `/store` — 前台商品列表
- `/store/product/:id` — 商品詳情頁（顯示「優惠買就送」banner）
- `/store/cart` — 購物車（贈品列、不要贈品、「還差 XX 元」提示）
- `/store/checkout` — 結帳頁

## Demo 工具

右下角浮動 🐛 按鈕：**State Inspector Drawer**

- 贈品評估 tab：即時看狀態機 B 的評估結果
- 規則狀態 tab：強制觸發狀態機 A 的轉換、模擬耗盡事件
- 購物車 tab：切換會員等級、看 cart JSON、清空購物車
- 右上「重置全部」按鈕：清 localStorage + 恢復初始資料

## 資料結構

- `src/data/fakeData.js` — 所有假資料（商品、贈品規則、會員、產線、溫層）
- localStorage keys：
  - `gift-demo:rules` — 贈品規則（含狀態）
  - `gift-demo:cart`  — 購物車內容
  - `gift-demo:member` — 當前會員

## 專案結構

```
src/
├── App.jsx                 # 路由
├── main.jsx
├── index.css
├── layouts/
│   ├── AdminLayout.jsx     # 後台殼（左側選單 + 頂部麵包屑）
│   └── StoreLayout.jsx     # 前台殼（頂部導航 + 購物車入口）
├── pages/
│   ├── HomePage.jsx
│   ├── admin/
│   │   ├── AdminGiftRules.jsx      # 列表（仿 Figma 380:504）
│   │   └── AdminGiftRuleEdit.jsx   # 編輯（仿 Figma 380:730）
│   └── store/
│       ├── StoreProductList.jsx
│       ├── StoreProductDetail.jsx  # 「優惠買就送」banner（仿 Figma 444:881）
│       ├── StoreCart.jsx           # 購物車贈品列（仿 Figma 345:1074）
│       └── StoreCheckout.jsx
├── components/
│   ├── GiftRuleStateMachine.jsx    # antd Steps 狀態機視覺化
│   ├── CartGiftStateMachine.jsx
│   ├── GiftRow.jsx                 # 購物車中的贈品列
│   ├── GiftHintBanner.jsx          # 「還差 95 元...」提示
│   ├── GiftRuleModal.jsx           # 活動說明彈窗（仿 Figma 424:270 / 446:506）
│   ├── BuyToGetBanner.jsx          # 商品頁「優惠買就送」
│   ├── SpecifiedProductsModal.jsx  # 後台指定商品選取（仿 Figma 380:948）
│   ├── StatusTag.jsx
│   └── StateInspectorDrawer.jsx    # Debug 浮動面板
├── context/
│   ├── GiftRuleContext.jsx         # 規則 CRUD + 狀態轉換
│   └── CartContext.jsx             # 購物車 + giftEvaluation useMemo
├── data/
│   └── fakeData.js
└── utils/
    ├── giftRuleStateMachine.js     # 狀態機 A：合法轉換表 + 轉換函式
    └── cartGiftEvaluator.js        # 狀態機 B：evaluateCartGifts 核心
```

## 技術選型

- React 19 + Vite 7
- Ant Design 6
- react-router-dom 7
- dayjs

## 搬到 fruit_web 對應

| Demo 檔案 | fruit_web 對應 |
|---|---|
| `utils/giftRuleStateMachine.js` | `GreenBox.Service/Implementation/Gift/GiftRuleStateService.cs` |
| `utils/cartGiftEvaluator.js`    | `GreenBox.Service/Implementation/Gift/CartGiftService.cs` |
| `data/fakeData.js`              | `GiftRules` 資料表 + seed data |
| `pages/admin/*`                 | `HuashanCRM/Areas/GoX/Views/Gift/*.cshtml`（Razor 改寫） |
| `components/GiftRow.jsx` 等前台 | `react-component-export/src/components/cart/*.tsx` |

詳見 `D:\Obsidian\projects\Gb-贈品系統\規劃文件\`。
