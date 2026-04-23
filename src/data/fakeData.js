// 完全比照 https://greenbox.tw/Orders/ConfirmOrder 的資料
// 所有 PID/PdId/圖片/價格/庫存 皆來自線上 DOM
//
// 【Phase D 對齊 fruit_web】
// - 所有 API DTO 欄位全部 PascalCase
// - 分類用 ProductCategoryEnum 整數值當 Type（冷凍專區=7、粥寶寶專區=9、益菓保=11）
// - 溫層用 TemperatureLayer 整數（常溫=1、冷藏=2、冷凍=3）
// - 僅保留 `uid` 為 camelCase，作為 React key 使用（不傳後端）

// ─── 對齊 fruit_web 的 Enum ─────────────────────────
export const ProductCategoryEnum = {
  無分類: -1,
  產地直送: 0,
  加購品: 1,
  快速到貨: 2,
  企業合作: 3,
  Vip會員卡: 4,
  箱類: 5,
  週期性商品: 6,
  冷凍專區: 7,
  宅魚_宅魚鮮吃: 8,
  粥寶寶專區: 9,
  無法辨識: 10,
  益菓保: 11,
}

export const TemperatureLayer = {
  未知: 0,
  常溫: 1,
  冷藏: 2,
  冷凍: 3,
}

// ─── 分類（用來渲染 categorey-title 等）──
// Key 用 ProductCategoryEnum 整數，方便從 cart item 的 Type 直接查表
export const CATEGORIES = {
  [ProductCategoryEnum.冷凍專區]: {
    Type: ProductCategoryEnum.冷凍專區,
    Title: '冷凍超市',
    DataType: '冷凍專區',
    Icon: 'https://fruitbox.blob.core.windows.net/pagematerials/shared/冷凍專區_icon.png',
    SaAreaId: 'SA-Area-Frozen',
    FreightLink: '/Products/FrozenFood?categoryName=onsale',
    FreightThreshold: 1500,
    FreightFee: 150,
    FreightLabel: '冷凍專區(冷凍)',
  },
  [ProductCategoryEnum.粥寶寶專區]: {
    Type: ProductCategoryEnum.粥寶寶專區,
    Title: '粥寶寶/綠時光',
    DataType: '粥寶寶專區',
    Icon: 'https://fruitbox.blob.core.windows.net/pagematerials/shared/粥寶寶專區_icon.png',
    SaAreaId: 'SA-Area-BabyFood',
    FreightLink: '/Products/Kitchenette',
    FreightThreshold: 1500,
    FreightFee: 150,
    FreightLabel: '粥寶寶專區(冷凍)',
  },
}

// ─── 初始購物車：商品依 Type 分組 ──
// 每項對應 fruit_web 的 `CartItem`（HuashanCRM/Models/Cart/CartItem.cs）+ 未來新增的
// IsGift / GiftRuleId / IsGiftDeclined 三個欄位
export const initialCart = [
  {
    Type: ProductCategoryEnum.冷凍專區,
    Items: [
      {
        uid: 'f-62376-97410',
        ProductId: 62376,
        ProductDetailId: 97410,
        ProductName: '【野人舒食】沙漠湖鹽雞胸',
        ProductSpec: '1 包',
        SpecSuffix: '',
        NameWarning: '',
        Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202502200530421.jpg',
        DeliveryTime: '2026/04/22 ~',
        Price: 45,
        Quantity: 1,
        MaxQty: 33,
        Type: ProductCategoryEnum.冷凍專區,
        TemperatureType: TemperatureLayer.冷凍,
        TemperatureTypeName: '冷凍',
        IsGift: false,
        GiftRuleId: null,
        IsGiftDeclined: false,
      },
      {
        uid: 'f-75491-161120',
        ProductId: 75491,
        ProductDetailId: 161120,
        ProductName: '新客限定【宅魚】-澎湖蟹管肉',
        ProductSpec: '1 包',
        SpecSuffix: '(100g，限購1份)',
        NameWarning: '',
        Pic: 'https://greenboxcdn.azureedge.net/products/Images/20250204160003.webp',
        DeliveryTime: '2026/04/22 ~',
        Price: 99,
        Quantity: 1,
        MaxQty: 88,
        Type: ProductCategoryEnum.冷凍專區,
        TemperatureType: TemperatureLayer.冷凍,
        TemperatureTypeName: '冷凍',
        IsGift: false,
        GiftRuleId: null,
        IsGiftDeclined: false,
      },
    ],
  },
  {
    Type: ProductCategoryEnum.粥寶寶專區,
    Items: [
      {
        uid: 'b-66539-116462',
        ProductId: 66539,
        ProductDetailId: 116462,
        ProductName: '一歲以上PLUS+ 閃亮升級燉飯組合',
        ProductSpec: '1 組',
        SpecSuffix: '(有牛/10入，150克/入)',
        NameWarning: '本產品已經過多次人工挑刺與去除鱗片，但仍有機率魚刺殘留，建議檢查後再給寶寶食用，餵食時仍須注意。',
        Pic: 'https://greenboxcdn.azureedge.net/products/Images/20241126175153.webp',
        DeliveryTime: '2026/04/22 ~',
        Price: 949,
        Quantity: 1,
        MaxQty: 20,
        Type: ProductCategoryEnum.粥寶寶專區,
        TemperatureType: TemperatureLayer.冷凍,
        TemperatureTypeName: '冷凍',
        IsGift: false,
        GiftRuleId: null,
        IsGiftDeclined: false,
      },
      // 綜合米餅六入組 × 2 — 用來觸發買就送；加上燉飯組合後也觸發滿額贈
      {
        uid: 'b-75762-180001',
        ProductId: 75762,
        ProductDetailId: 180001,
        ProductName: '【限時免運】綜合米餅六入組',
        ProductSpec: '1 組',
        SpecSuffix: '(香蕉、鳳梨、草莓米餅 3 口味共 6 包，約 50±3 克/包)',
        NameWarning: '',
        Pic: 'https://greenboxcdn.azureedge.net/upload/Album_3035/File/202604021019081.jpg',
        DeliveryTime: '2026/04/22 ~',
        Price: 900,
        Quantity: 2,
        MaxQty: 10,
        Type: ProductCategoryEnum.粥寶寶專區,
        TemperatureType: TemperatureLayer.冷凍,
        TemperatureTypeName: '冷凍',
        IsGift: false,
        GiftRuleId: null,
        IsGiftDeclined: false,
      },
    ],
  },
]

// ─── 超值加購：每個 SA area 的 items ──
// Items 欄位對齊 CartOrderItem 基本欄位（ProductId/ProductDetailId/ProductName/Pic/...）
// OriginPrice / DiscountPrice 是 demo 用的加購價資訊
export const SA_AREAS = {
  'SA-Area-Frozen': {
    Type: ProductCategoryEnum.冷凍專區,
    Items: [
      {
        ProductId: 75981, ProductDetailId: 163597,
        ProductName: '滿$999加購【無毒農嚴選】櫻桃鴨胸（大） 260g±10%',
        TemperatureTypeName: '冷凍',
        Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202505080228511.jpg',
        OriginPrice: 329, DiscountPrice: 209,
      },
      {
        ProductId: 76603, ProductDetailId: 166096,
        ProductName: '滿$999超值加購【無毒農嚴選】宜蘭冬山公香魚 150g-200g/尾',
        TemperatureTypeName: '冷凍',
        Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202510140722091.jpg',
        OriginPrice: 69, DiscountPrice: 49,
      },
      {
        ProductId: 76443, ProductDetailId: 165474,
        ProductName: '滿$999超值加購【宅肉坊】豬五花燒肉片',
        TemperatureTypeName: '冷凍',
        Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202504160517021.jpg',
        OriginPrice: 170, DiscountPrice: 153,
      },
      {
        ProductId: 72964, ProductDetailId: 150419,
        ProductName: '滿$999加購【宅肉坊】去皮清雞胸肉',
        TemperatureTypeName: '冷凍',
        Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202502200525301.jpg',
        OriginPrice: 175, DiscountPrice: 158,
      },
    ],
  },
  'SA-Area-BabyFood': {
    Type: ProductCategoryEnum.粥寶寶專區,
    Items: [
      {
        ProductId: 73189, ProductDetailId: 167992,
        ProductName: '超值加購│大人系養生-山藥鮑魚雞湯(2026-07-20到期)',
        TemperatureTypeName: '冷凍',
        Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202506230625241.png',
        OriginPrice: 199, DiscountPrice: 195,
      },
      {
        ProductId: 73192, ProductDetailId: 167993,
        ProductName: '超值加購│大人系養生-山藥排骨湯(2026-07-20到期)',
        TemperatureTypeName: '冷凍',
        Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202506230612591.png',
        OriginPrice: 199, DiscountPrice: 195,
      },
      {
        ProductId: 72144, ProductDetailId: 167400,
        ProductName: '超值加購│一歲半以上-塔香雙茄打拋豬炒飯 2入，200克/入',
        TemperatureTypeName: '冷凍',
        Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202504220622271.png',
        OriginPrice: 250, DiscountPrice: 245,
      },
      {
        ProductId: 76928, ProductDetailId: 167995,
        ProductName: '超值加購│Stasher方形矽膠密封袋-粥寶寶客製款(白色) 白色',
        TemperatureTypeName: '冷凍',
        Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202603240416031.png',
        OriginPrice: 520, DiscountPrice: 480,
      },
    ],
  },
}

// ─── header 裝飾（用在 StoreLayout 的 Header）──
export const member = { name: 'Glen Wen' }

export const navLinks = [
  { label: '關於無毒農' },
  { label: '粥寶寶' },
  { label: '益菓保' },
  { label: 'NEW!綠時光', newBadge: true },
  { label: '產地直送(免運)' },
  { label: '冷凍超市' },
  { label: '等家寶寶' },
  { label: '部落格' },
]
