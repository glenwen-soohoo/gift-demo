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

import { ProductCategoryEnum, TemperatureLayer } from './fakeData'

export const DEMO_PRODUCTS = {
  69928: {
    Id: 69928,
    Name: '粥寶寶多功能保冷袋',
    ProductionLine: ProductCategoryEnum.粥寶寶專區,
    TemperatureLayer: TemperatureLayer.冷凍,
    Specs: [
      {
        Id: 163483,
        Sort: 0,
        Detail: '贈品',
        Quantity: 1,
        Unit: '個',
        OriginAmt: 0,
        DiscPrice: 0,
        Stock: 10,
        SoldAmt: 0,
        Cost: 140,
        Freight: 0,
        OrdersTime: '2026-01-22',
        OrdersFinalExportTime: '',
        StartTime: '2026-01-19 00:00',
        EndTime: '2026-02-28 00:00',
        AutoReplenishOnZero: 1,
        // 規格限制（demo 暫統一放這層）
        Display: true,
        IsYuanxiong: false,
        IsSpecial: false,
        IsCOD: false,
        IsSubscritpion: false,
        ThresholdAmount: 0,
        Limit: 0,
        IsGift: true,
      },
      {
        Id: 163484,
        Sort: 1,
        Detail: '一般規格',
        Quantity: 1,
        Unit: '個',
        OriginAmt: 199,
        DiscPrice: 149,
        Stock: 50,
        SoldAmt: 12,
        Cost: 60,
        Freight: 50,
        OrdersTime: '2026-01-22',
        OrdersFinalExportTime: '2026-02-28',
        StartTime: '2026-01-19 00:00',
        EndTime: '2026-02-28 00:00',
        AutoReplenishOnZero: 1,
        Display: true,
        IsYuanxiong: false,
        IsSpecial: false,
        IsCOD: false,
        IsSubscritpion: false,
        ThresholdAmount: 0,
        Limit: 0,
        IsGift: false,
      },
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
