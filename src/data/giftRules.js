// 贈品規則資料模型
//
// 【Phase D 對齊 fruit_web】
// - 所有欄位 PascalCase
// - ProductionLine 用 ProductCategoryEnum 整數（冷凍專區=7、粥寶寶=9、益菓保=11、產地直送=0）
// - TemperatureLayer 用整數（常溫=1、冷藏=2、冷凍=3）
// - RuleType 用 PascalCase 字串（'Threshold' / 'BuyToGet'），會對應到 C# enum GiftRuleType
// - State 用整數：0=草稿 / 1=上架中 / 2=暫停 / 3=下架 / 4=已耗盡
// - MembershipLimits 用字串陣列，對應 C# 會新增的 MembershipLimitType enum
//
// ConfirmOrder 前台會從這份規則表直接讀（demo 單一來源），未來 fruit_web 則由
// `CartGiftService.EvaluateGifts` 從 DB 撈 GiftRules 表回傳

import { ProductCategoryEnum, TemperatureLayer } from './fakeData'

// ─── 規則型別 ───────────────────────────────
export const RULE_TYPE = {
  Threshold: { Value: 'Threshold', Label: '滿額贈' },
  BuyToGet:  { Value: 'BuyToGet',  Label: '買就送' },
}

// ─── 規則狀態 ───────────────────────────────
export const GIFT_RULE_STATE = {
  草稿:  0,
  上架中: 1,
  暫停:  2,
  下架:  3,
  已耗盡: 4,
}

// ─── 產線（對齊 ProductCategoryEnum）──────────
// Value 是 ProductCategoryEnum 整數；demo-only 的用 100+ 佔位（fruit_web 沒有對應枚舉）
export const PRODUCTION_LINES = [
  { Value: ProductCategoryEnum.冷凍專區,   Label: '冷凍超市', Color: '#5CB0DF' },
  { Value: ProductCategoryEnum.粥寶寶專區, Label: '粥寶寶',   Color: '#F4ABAF' },
  { Value: ProductCategoryEnum.益菓保,     Label: '益菓保',   Color: '#F4ABAF' },
  { Value: ProductCategoryEnum.產地直送,   Label: '產地直送', Color: '#4BA83B' },
  { Value: 100,                             Label: '蔬果乾貨', Color: '#b59248' },  // demo only
  { Value: 101,                             Label: '生鮮肉舖', Color: '#c96f3b' },  // demo only
]

// ─── 溫層 ────────────────────────────────
export const TEMPERATURES = [
  { Value: TemperatureLayer.冷凍,   Label: '冷凍' },
  { Value: TemperatureLayer.冷藏,   Label: '冷藏' },
  { Value: TemperatureLayer.常溫,   Label: '常溫' },
]

// ─── 限購等級 ─────────────────────────────
export const MEMBERSHIP_LIMITS = [
  { Value: 'VIP',        Label: 'VIP' },
  { Value: 'VVIP',       Label: 'VVIP' },
  { Value: 'SVIP',       Label: 'SVIP' },
  { Value: 'FirstOrder', Label: '首購' },
]

// ─── 初始贈品規則 ────────────────────────────
// 保留 7 筆，前 2 筆對應 demo 前台 ConfirmOrder 的觸發情境（保冷袋滿額贈 + 集點卡買就送）
export const initialGiftRules = [
  // 1) 保冷袋 — 粥寶寶滿 2000 送
  {
    Id: 163483,
    ProductId: 69928,
    ProductName: '粥寶寶多功能保冷袋',
    ProductSpec: '1 個',
    SpecSuffix: '(贈品)',
    Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202502200530421.jpg',
    DeliveryTime: '2026/04/22 ~',
    RuleType: 'Threshold',
    ProductionLine: ProductCategoryEnum.粥寶寶專區,
    TemperatureLayer: TemperatureLayer.冷凍,
    ThresholdAmount: 2000,
    HintAmount: 1800,
    ThresholdQuantity: 0,
    UseProductIds: false,
    UseSpecIds: false,
    TargetProductIds: [],
    TargetSpecIds: [],
    GiftQuantity: 1,
    Repeatable: false,
    PopupText:
      '粥寶寶專區消費滿 $2,000 元，即可獲得此贈品一份。\n限 VIP 等級（含）以上會員。\n每筆訂單限獲一份，數量有限，送完為止。',
    Stock: 10,
    IsListed: true,
    MembershipLimits: ['VIP', 'VVIP', 'SVIP'],
    State: GIFT_RULE_STATE.上架中,
    StartTime: null,
    EndTime: null,
    CreateTime: '2026/01/30 14:00',
    CreateUserId: 0,
    CreateUser: '某某某',
    UpdateTime: '',
    UpdateUserId: 0,
  },
  // 2) 集點卡（粥寶寶冷凍）— 買米餅送，可重複
  {
    Id: 137029,
    ProductId: 69929,
    ProductName: '粥寶寶集點趣｜集點卡，米餅肉鬆適用',
    ProductSpec: '1 張',
    SpecSuffix: '(贈品)',
    Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202502200530421.jpg',
    DeliveryTime: '2026/04/22 ~',
    RuleType: 'BuyToGet',
    ProductionLine: ProductCategoryEnum.粥寶寶專區,
    TemperatureLayer: TemperatureLayer.冷凍,
    ThresholdAmount: 0,
    HintAmount: 0,
    ThresholdQuantity: 1,
    UseProductIds: true,
    UseSpecIds: false,
    TargetProductIds: [75762],
    TargetSpecIds: [],
    GiftQuantity: 1,
    Repeatable: true,
    PopupText:
      '購買【綜合米餅六入組】每 1 件（含）以上，即可獲得此贈品一份。\n限首購會員。\n可重複贈送：購買越多、集點卡送越多！',
    Stock: 0,
    IsListed: true,
    MembershipLimits: ['FirstOrder'],
    State: GIFT_RULE_STATE.上架中,
    StartTime: null,
    EndTime: null,
    CreateTime: '2026/01/15 09:00',
    CreateUserId: 0,
    CreateUser: '某某某',
    UpdateTime: '',
    UpdateUserId: 0,
  },
  // 3) 保冷袋（第二條） — 買就送版本，示範同一贈品可以掛多條規則
  {
    Id: 163484,
    ProductId: 69928,
    ProductName: '粥寶寶多功能保冷袋',
    ProductSpec: '1 個',
    SpecSuffix: '(贈品)',
    Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202502200530421.jpg',
    DeliveryTime: '2026/04/22 ~',
    RuleType: 'BuyToGet',
    ProductionLine: ProductCategoryEnum.粥寶寶專區,
    TemperatureLayer: TemperatureLayer.冷凍,
    ThresholdAmount: 0,
    HintAmount: 0,
    ThresholdQuantity: 1,
    UseProductIds: true,
    UseSpecIds: false,
    TargetProductIds: [75760],
    TargetSpecIds: [],
    GiftQuantity: 1,
    Repeatable: false,
    PopupText: '',
    Stock: 0,
    IsListed: true,
    MembershipLimits: ['VIP', 'VVIP', 'SVIP'],
    State: GIFT_RULE_STATE.上架中,
    StartTime: null,
    EndTime: null,
    CreateTime: '2026/01/28 10:30',
    CreateUserId: 0,
    CreateUser: '某某某',
    UpdateTime: '',
    UpdateUserId: 0,
  },
  // 4) 集點卡（常溫版） — 買米餅送，可重複
  {
    Id: 136837,
    ProductId: 69929,
    ProductName: '粥寶寶集點趣｜集點卡，米餅肉鬆適用',
    ProductSpec: '1 張',
    SpecSuffix: '(贈品)',
    Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202502200530421.jpg',
    DeliveryTime: '2026/04/22 ~',
    RuleType: 'BuyToGet',
    ProductionLine: ProductCategoryEnum.粥寶寶專區,
    TemperatureLayer: TemperatureLayer.常溫,
    ThresholdAmount: 0,
    HintAmount: 0,
    ThresholdQuantity: 1,
    UseProductIds: true,
    UseSpecIds: false,
    TargetProductIds: [75762],
    TargetSpecIds: [],
    GiftQuantity: 1,
    Repeatable: true,
    PopupText: '',
    Stock: 5,
    IsListed: true,
    MembershipLimits: ['FirstOrder'],
    State: GIFT_RULE_STATE.上架中,
    StartTime: null,
    EndTime: null,
    CreateTime: '2026/01/10 11:00',
    CreateUserId: 0,
    CreateUser: '某某某',
    UpdateTime: '',
    UpdateUserId: 0,
  },
  // 5) 折扣碼禮 — 生鮮肉舖滿額贈
  {
    Id: 163449,
    ProductId: 75947,
    ProductName: '滿$2300輸入折扣碼【NIE250】現折$250',
    ProductSpec: '1 次',
    SpecSuffix: '(請自行輸入折扣碼)',
    Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202502200530421.jpg',
    DeliveryTime: '2026/04/22 ~',
    RuleType: 'Threshold',
    ProductionLine: 101,                         // 生鮮肉舖（demo-only）
    TemperatureLayer: TemperatureLayer.冷凍,
    ThresholdAmount: 2300,
    HintAmount: 2000,
    ThresholdQuantity: 0,
    UseProductIds: false,
    UseSpecIds: false,
    TargetProductIds: [],
    TargetSpecIds: [],
    GiftQuantity: 1,
    Repeatable: false,
    PopupText: '',
    Stock: 90,
    IsListed: true,
    MembershipLimits: [],
    State: GIFT_RULE_STATE.上架中,
    StartTime: null,
    EndTime: null,
    CreateTime: '2026/01/05 16:00',
    CreateUserId: 0,
    CreateUser: '某某某',
    UpdateTime: '',
    UpdateUserId: 0,
  },
  // 6) 感恩禮卡 — 未設定（從產品編輯頁勾選「設為贈品」後產生的 draft）
  {
    Id: 163500,
    ProductId: 70030,
    ProductName: '無毒農質感感恩禮卡',
    ProductSpec: '1 張',
    SpecSuffix: '',
    Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202502200530421.jpg',
    DeliveryTime: '2026/04/22 ~',
    RuleType: null,
    ProductionLine: ProductCategoryEnum.粥寶寶專區,
    TemperatureLayer: TemperatureLayer.常溫,
    ThresholdAmount: 0,
    HintAmount: 0,
    ThresholdQuantity: 0,
    UseProductIds: false,
    UseSpecIds: false,
    TargetProductIds: [],
    TargetSpecIds: [],
    GiftQuantity: 1,
    Repeatable: false,
    PopupText: '',
    Stock: 50,
    IsListed: false,                  // 條件未設定前不能上架
    MembershipLimits: [],
    State: GIFT_RULE_STATE.草稿,
    StartTime: null,
    EndTime: null,
    CreateTime: new Date().toLocaleString('zh-TW', { hour12: false }),
    CreateUserId: 0,
    CreateUser: 'Glen Wen',
    UpdateTime: '',
    UpdateUserId: 0,
  },
  // 7) 折扣碼禮（下架中）
  {
    Id: 161810,
    ProductId: 75630,
    ProductName: '滿$2200輸入折扣碼【ANV100】現折$250',
    ProductSpec: '1 次',
    SpecSuffix: '(請自行輸入折扣碼)',
    Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202502200530421.jpg',
    DeliveryTime: '2026/04/22 ~',
    RuleType: 'Threshold',
    ProductionLine: 101,
    TemperatureLayer: TemperatureLayer.冷凍,
    ThresholdAmount: 2200,
    HintAmount: 2000,
    ThresholdQuantity: 0,
    UseProductIds: false,
    UseSpecIds: false,
    TargetProductIds: [],
    TargetSpecIds: [],
    GiftQuantity: 1,
    Repeatable: false,
    PopupText: '',
    Stock: 90,
    IsListed: false,
    MembershipLimits: [],
    State: GIFT_RULE_STATE.下架,
    StartTime: null,
    EndTime: null,
    CreateTime: '2025/12/20 10:00',
    CreateUserId: 0,
    CreateUser: '某某某',
    UpdateTime: '2026/01/05 09:30',
    UpdateUserId: 0,
  },
]

// ─── 後台「指定產品 / 規格名稱」modal 用的對照表 ──
export const TARGET_PRODUCT_NAMES = {
  75766: '大富翁-大寶寶-干貝菇菇翡翠雞蛋粥',
  75765: '大富翁-一歲以上-干貝金玉翡翠蛋燉飯PLUS+',
  75764: '大富翁-中寶寶-干貝菇菇香蛋粥',
  75763: '大富翁-小寶寶-蘋果洋蔥米糊PLUS+',
  75760: '一歲以上 PLUS+ 閃亮升級燉飯組合',
  62376: '【野人舒食】沙漠湖鹽雞胸',
  75491: '新客限定【宅魚】-澎湖蟹管肉',
  66539: '一歲以上PLUS+ 閃亮升級燉飯組合',
  75762: '【限時免運】綜合米餅六入組',
}

// 規格 ID → 名稱 / 規格描述
export const TARGET_SPEC_NAMES = {
  123456: { ProductName: '大富翁-大寶寶-干貝菇菇翡翠雞蛋粥', Spec: '1 包' },
  123457: { ProductName: '大富翁-一歲以上-干貝金玉翡翠蛋燉飯PLUS+', Spec: '2 入/組' },
  123458: { ProductName: '大富翁-一歲以上-干貝金玉翡翠蛋燉飯PLUS+', Spec: '10 入/組' },
  123459: { ProductName: '大富翁-中寶寶-干貝菇菇香蛋粥', Spec: '1 包' },
  123464: { ProductName: '大富翁-小寶寶-蘋果洋蔥米糊PLUS+', Spec: '小份' },
  123465: { ProductName: '大富翁-小寶寶-蘋果洋蔥米糊PLUS+', Spec: '中份' },
  123466: { ProductName: '大富翁-小寶寶-蘋果洋蔥米糊PLUS+', Spec: '大份' },
  97410:  { ProductName: '【野人舒食】沙漠湖鹽雞胸', Spec: '1 包' },
  161120: { ProductName: '新客限定【宅魚】-澎湖蟹管肉', Spec: '1 包 (100g)' },
  116462: { ProductName: '一歲以上PLUS+ 閃亮升級燉飯組合', Spec: '1 組 (有牛/10入, 150克/入)' },
  180001: { ProductName: '【限時免運】綜合米餅六入組', Spec: '1 組' },
}
