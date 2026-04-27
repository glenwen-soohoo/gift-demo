// 產品規格假資料 — 對應 Figma 贈品-產品頁
// 每個產品有多個規格（spec），每個 spec 可獨立設定規格限制
//
// 【Phase D 對齊 fruit_web】
// - 欄位名盡量對齊 ProductDetail（designer.cs）既有欄位：Id / Sort / Detail / Cost / Freight /
//   OrdersTime / OrdersFinalExportTime / StartTime / EndTime / AutoReplenishOnZero / Display /
//   OriginAmt / DiscPrice / SoldAmt / Limit
// - Demo 內部用但 ProductDetail 未必有專屬欄位的限制旗標（IsSpecial / IsCOD / IsSubscritpion /
//   IsYuanxiong / ThresholdAmount）暫統一放 spec 層；fruit_web 實作時再決定歸屬表
// - 保留舊 IsSubscritpion 拼寫，對齊 fruit_web CartItem.cs 既有拼寫錯誤（不改舊債）
//
// 【「上架」與「庫存」的單一資料來源】
// - 贈品的 Display（上架）和 Stock（庫存）就在這份規格資料裡
// - 後台「贈品管理」列表的上下架 toggle 與鉛筆編輯庫存，最終都透過 ProductContext.updateSpec
//   寫進這裡。產品管理 Edit18 改也是同樣寫進來。兩個 UI 入口共用同一筆 spec 資料，避免 drift

import { ProductCategoryEnum, TemperatureLayer } from './fakeData'

// ─── 通用：贈品規格產生器（Display=true、IsGift=true、其他互斥欄位都關）──
function makeGiftSpec({ Id, Detail = '贈品', Stock, Cost = 0 }) {
  return {
    Id,
    Sort: 0,
    Detail,
    Quantity: 1,
    Unit: '個',
    OriginAmt: 0,
    DiscPrice: 0,
    Stock,
    SoldAmt: 0,
    Cost,
    Freight: 0,
    OrdersTime: '2026-01-22',
    OrdersFinalExportTime: '',
    StartTime: '2026-01-19 00:00',
    EndTime: '',
    AutoReplenishOnZero: 0,
    Display: true,            // 上架（贈品系統的「上架」就是這個）
    IsYuanxiong: false,
    IsSpecial: false,
    IsCOD: false,
    IsSubscritpion: false,
    ThresholdAmount: 0,
    Limit: 0,
    IsGift: true,
  }
}

export const DEMO_PRODUCTS = {
  // 69928 粥寶寶多功能保冷袋（兩條 GiftRule 都掛這個 product：163483 滿額贈、163484 買就送）
  69928: {
    Id: 69928,
    Name: '粥寶寶多功能保冷袋',
    ProductionLine: ProductCategoryEnum.粥寶寶專區,
    TemperatureLayer: TemperatureLayer.冷凍,
    Specs: [
      makeGiftSpec({ Id: 163483, Detail: '贈品', Stock: 10, Cost: 140 }),
      makeGiftSpec({ Id: 163484, Detail: '贈品（買就送版本）', Stock: 0, Cost: 140 }),
      // 訂閱制方案 — 留著當「非贈品規格」示範
      {
        Id: 163485,
        Sort: 2,
        Detail: '訂閱制方案',
        Quantity: 1,
        Unit: '組',
        OriginAmt: 899,
        DiscPrice: 799,
        Stock: 99,
        SoldAmt: 3,
        Cost: 400,
        Freight: 0,
        OrdersTime: '2026-01-22',
        OrdersFinalExportTime: '',
        StartTime: '2026-01-19 00:00',
        EndTime: '2026-12-31 00:00',
        AutoReplenishOnZero: 7,
        Display: true,
        IsYuanxiong: false,
        IsSpecial: false,
        IsCOD: false,
        IsSubscritpion: true,
        ThresholdAmount: 0,
        Limit: 0,
        IsGift: false,
      },
    ],
  },

  // 69929 粥寶寶集點趣｜集點卡，米餅肉鬆適用（rule 137029 冷凍版）
  69929: {
    Id: 69929,
    Name: '粥寶寶集點趣｜集點卡，米餅肉鬆適用',
    ProductionLine: ProductCategoryEnum.粥寶寶專區,
    TemperatureLayer: TemperatureLayer.冷凍,
    Specs: [
      makeGiftSpec({ Id: 137029, Detail: '贈品', Stock: 0 }),
    ],
  },

  // 69965 粥寶寶集點趣｜集點卡（rule 136837 常溫版，預設下架）
  69965: {
    Id: 69965,
    Name: '粥寶寶集點趣｜集點卡，米餅肉鬆適用（常溫）',
    ProductionLine: ProductCategoryEnum.粥寶寶專區,
    TemperatureLayer: TemperatureLayer.常溫,
    Specs: [
      // Display=false 對應之前的 IsListed=false（下架）
      { ...makeGiftSpec({ Id: 136837, Detail: '贈品（常溫版）', Stock: 5 }), Display: false },
    ],
  },

  // 75947 折扣碼禮 NIE250（rule 163449）
  75947: {
    Id: 75947,
    Name: '滿$2300輸入折扣碼【NIE250】現折$250',
    ProductionLine: 101,           // demo-only 生鮮肉舖
    TemperatureLayer: TemperatureLayer.冷凍,
    Specs: [
      makeGiftSpec({ Id: 163449, Detail: '贈品（折扣碼）', Stock: 90 }),
    ],
  },

  // 70030 感恩禮卡（rule 163500，draft 狀態，Display=false）
  70030: {
    Id: 70030,
    Name: '無毒農質感感恩禮卡',
    ProductionLine: ProductCategoryEnum.粥寶寶專區,
    TemperatureLayer: TemperatureLayer.常溫,
    Specs: [
      { ...makeGiftSpec({ Id: 163500, Detail: '贈品（草稿）', Stock: 50 }), Display: false },
    ],
  },

  // 75630 折扣碼禮 ANV100（rule 161810，下架）
  75630: {
    Id: 75630,
    Name: '滿$2200輸入折扣碼【ANV100】現折$250',
    ProductionLine: 101,
    TemperatureLayer: TemperatureLayer.冷凍,
    Specs: [
      { ...makeGiftSpec({ Id: 161810, Detail: '贈品（折扣碼）', Stock: 90 }), Display: false },
    ],
  },
}

// 空白規格產生器 — 用於「新增規格」按鈕
export function createBlankSpec(nextId, sort = 0) {
  return {
    Id: nextId,
    Sort: sort,
    Detail: '',
    Quantity: 1,
    Unit: '個',
    OriginAmt: 0,
    DiscPrice: 0,
    Stock: 0,
    SoldAmt: 0,
    Cost: 0,
    Freight: 0,
    OrdersTime: '',
    OrdersFinalExportTime: '',
    StartTime: '',
    EndTime: '',
    AutoReplenishOnZero: 0,
    Display: true,
    IsYuanxiong: false,
    IsSpecial: false,
    IsCOD: false,
    IsSubscritpion: false,
    ThresholdAmount: 0,
    Limit: 0,
    IsGift: false,
  }
}

// ─── 工具函式：用 ProductDetailId 找對應的 ProductDetail（跨 product 搜尋）──
// production: SELECT * FROM ProductDetail WHERE Id = @productDetailId
export function findSpecById(products, productDetailId) {
  for (const product of Object.values(products ?? {})) {
    const spec = product.Specs?.find(s => s.Id === productDetailId)
    if (spec) return { product, spec }
  }
  return null
}
