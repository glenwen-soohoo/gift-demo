// 完全比照 https://greenbox.tw/Orders/ConfirmOrder 上實際看到的資料
// 所有 PID/PdId/圖片/價格/剩餘組數 都來自線上 DOM 抽取

// ─── 分類（仿 ProductCategoryEnum 概念，但只呈現用途）──
export const categories = [
  {
    key: 'frozen',
    title: '冷凍超市',
    dataType: '冷凍專區',
    icon: 'https://fruitbox.blob.core.windows.net/pagematerials/shared/冷凍專區_icon.png',
    saAreaId: 'SA-Area-Frozen',
    saAreaBg: '#5CB0DF', // panel-heading 冷凍超市 藍
  },
  {
    key: 'babyfood',
    title: '粥寶寶/綠時光',
    dataType: '粥寶寶專區',
    icon: 'https://fruitbox.blob.core.windows.net/pagematerials/shared/粥寶寶專區_icon.png',
    saAreaId: 'SA-Area-BabyFood',
    saAreaBg: '#F4ABAF', // panel-heading 粥寶寶 粉
  },
]

// ─── 訂單購物車：每個分類 → 溫層 → 商品 ──
export const cartOrders = [
  {
    categoryKey: 'frozen',
    temperatureGroups: [
      {
        temperatureLabel: '冷凍',
        items: [
          {
            pid: 62376,
            pdid: 97410,
            name: '【野人舒食】沙漠湖鹽雞胸',
            spec: '1 包',
            specSuffix: '',
            image: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202502200530421.jpg',
            deliveryTime: '2026/04/22 ~',
            price: 45,
            quantity: 1,
            maxQty: 12,
            stockHint: '剩餘 33 組',
          },
          {
            pid: 75491,
            pdid: 161120,
            name: '新客限定【宅魚】-澎湖蟹管肉',
            spec: '1 包',
            specSuffix: '(100g，限購1份)',
            image: 'https://greenboxcdn.azureedge.net/products/Images/20250204160003.webp',
            deliveryTime: '2026/04/22 ~',
            price: 99,
            quantity: 1,
            maxQty: 12,
            stockHint: '剩餘 88 組',
          },
        ],
      },
    ],
    subtotalId: 'priceFrozen',
    subtotal: 144,
    freightLink: '/Products/FrozenFood?categoryName=onsale',
    freightHint: '冷凍專區(冷凍)運費為150元，如滿1500元可享免運優惠',
    freightRemaining: '(尚差1356.0)',
  },
  {
    categoryKey: 'babyfood',
    temperatureGroups: [
      {
        temperatureLabel: '冷凍',
        items: [
          {
            pid: 66539,
            pdid: 116462,
            name: '一歲以上PLUS+ 閃亮升級燉飯組合',
            spec: '1 組',
            specSuffix: '(有牛/10入，150克/入)',
            nameWarning: '本產品已經過多次人工挑刺與去除鱗片，但仍有機率魚刺殘留，建議檢查後再給寶寶食用，餵食時仍須注意。',
            image: 'https://greenboxcdn.azureedge.net/products/Images/20241126175153.webp',
            deliveryTime: '2026/04/22 ~',
            price: 949,
            quantity: 1,
            maxQty: 12,
            stockHint: '剩餘 20 組',
          },
        ],
      },
    ],
    subtotalId: 'priceBaby',
    subtotal: 949,
    freightLink: '/Products/Kitchenette',
    freightHint: '粥寶寶專區(冷凍)運費為150元，如滿1500元可享免運優惠',
    freightRemaining: '(尚差551.0)',
  },
]

// ─── 超值加購專區 ──
export const saAreas = {
  'SA-Area-Frozen': [
    {
      pid: 75981, pdid: 163597,
      name: '滿$999加購【無毒農嚴選】櫻桃鴨胸（大） 260g±10%',
      temperatureLabel: '冷凍',
      image: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202505080228511.jpg',
      originPrice: 329,
      discountPrice: 209,
    },
    {
      pid: 76603, pdid: 166096,
      name: '滿$999超值加購【無毒農嚴選】宜蘭冬山公香魚 150g-200g/尾',
      temperatureLabel: '冷凍',
      image: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202510140722091.jpg',
      originPrice: 69,
      discountPrice: 49,
    },
    {
      pid: 76443, pdid: 165474,
      name: '滿$999超值加購【宅肉坊】豬五花燒肉片',
      temperatureLabel: '冷凍',
      image: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202504160517021.jpg',
      originPrice: 170,
      discountPrice: 153,
    },
    {
      pid: 72964, pdid: 150419,
      name: '滿$999加購【宅肉坊】去皮清雞胸肉',
      temperatureLabel: '冷凍',
      image: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202502200525301.jpg',
      originPrice: 175,
      discountPrice: 158,
    },
  ],
  'SA-Area-BabyFood': [
    {
      pid: 73189, pdid: 167992,
      name: '超值加購│大人系養生-山藥鮑魚雞湯(2026-07-20到期)',
      temperatureLabel: '冷凍',
      image: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202506230625241.png',
      originPrice: 199,
      discountPrice: 195,
    },
    {
      pid: 73192, pdid: 167993,
      name: '超值加購│大人系養生-山藥排骨湯(2026-07-20到期)',
      temperatureLabel: '冷凍',
      image: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202506230612591.png',
      originPrice: 199,
      discountPrice: 195,
    },
    {
      pid: 72144, pdid: 167400,
      name: '超值加購│一歲半以上-塔香雙茄打拋豬炒飯 2入，200克/入',
      temperatureLabel: '冷凍',
      image: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202504220622271.png',
      originPrice: 250,
      discountPrice: 245,
    },
    {
      pid: 76928, pdid: 167995,
      name: '超值加購│Stasher方形矽膠密封袋-粥寶寶客製款(白色) 白色',
      temperatureLabel: '冷凍',
      image: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202603240416031.png',
      originPrice: 520,
      discountPrice: 480,
    },
  ],
}

// ─── 導覽列 + Footer ──
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

// 優惠方案
export const discountSummary = {
  bonusOwned: 50,
  redPointOwned: 0,
  amountCartTotal: 1093,
}
