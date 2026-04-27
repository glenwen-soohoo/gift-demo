// 1:1 復刻 greenbox.tw 側邊購物車（#shopping-cart）
// 結構與 className 直接對齊 production sidebar/index.js 渲染出的 DOM。
//
// 階層：
//   drawer (w-290 bg-gb-green-light)
//     ├ Header（我的菜籃 + → arrow + 清空購物車）
//     ├ Summary card (cart-info)：每產線運費卡 + 總額 + 結帳按鈕
//     └ Items：先依 TemperatureType 分組（冷凍/冷藏/常溫），分組內依 Type（產線）顯示 pill
//
// 4.5 決策：側欄不計算贈品，只在底部顯示「贈品活動將於結帳頁面自動計算」提示文字。

import { useMemo } from 'react'
import CartSidebarGiftNotice from './CartSidebarGiftNotice'
import { CATEGORIES, ProductCategoryEnum, TemperatureLayer } from '../data/fakeData'

const FREIGHT_THRESHOLD = 1500
const FREIGHT_FEE = 150

// TemperatureLayer → c-* class（對應 production CSS bundle 抽出的類別）
// .c-frozen      bg #cff6ff border/text #001455
// .c-refrigerated bg/text #73bf00（深綠）
// .c-normal      bg #ff8e88（淺紅）
const TEMP_CLASS = {
  [TemperatureLayer.冷凍]: 'c-frozen',
  [TemperatureLayer.冷藏]: 'c-refrigerated',
  [TemperatureLayer.常溫]: 'c-normal',
}
const TEMP_LABEL = {
  [TemperatureLayer.冷凍]: '冷凍',
  [TemperatureLayer.冷藏]: '冷藏',
  [TemperatureLayer.常溫]: '常溫',
}

export default function CartSidebar({ items = [], onCheckout, onClear, hasActiveGiftRules = false }) {
  // 1) 依 Type 算各產線小計（給 summary 用，跟結帳頁一致）
  const summaryByType = useMemo(() => {
    const map = new Map()
    for (const it of items) {
      const t = it.Type ?? ProductCategoryEnum.冷凍專區
      if (!map.has(t)) map.set(t, { Type: t, Items: [], Subtotal: 0 })
      const entry = map.get(t)
      entry.Items.push(it)
      entry.Subtotal += (it.Price ?? 0) * (it.Quantity ?? 0)
    }
    return [...map.values()]
  }, [items])

  // 2) 依 TemperatureType 分大組，每組內再依 Type 細分（給 items list 用）
  const groupedByTemp = useMemo(() => {
    const tempMap = new Map()
    for (const it of items) {
      const tempKey = it.TemperatureType ?? TemperatureLayer.冷凍
      if (!tempMap.has(tempKey)) tempMap.set(tempKey, new Map())
      const typeMap = tempMap.get(tempKey)
      const typeKey = it.Type ?? ProductCategoryEnum.冷凍專區
      if (!typeMap.has(typeKey)) typeMap.set(typeKey, [])
      typeMap.get(typeKey).push(it)
    }
    return [...tempMap.entries()].map(([tempType, typeMap]) => ({
      TemperatureType: tempType,
      TempLabel: TEMP_LABEL[tempType] ?? '冷凍',
      TempClass: TEMP_CLASS[tempType] ?? 'c-frozen',
      TypeGroups: [...typeMap.entries()].map(([type, list]) => ({
        Type: type,
        Category: CATEGORIES[type],
        Items: list,
      })),
    }))
  }, [items])

  const total = summaryByType.reduce((s, g) => s + g.Subtotal, 0)
  const empty = items.length === 0

  return (
    <div className="cs-drawer">
      {/* ── Header ── */}
      <div className="cs-header">
        <div className="cs-header-row">
          <h3 className="cs-title">我的菜籃</h3>
          <button type="button" className="cs-close-btn" aria-label="關閉菜籃">
            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="cs-close-svg">
              <path
                stroke="#4ba83b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                fill="none"
                d="M2 10h16m0 0l-7-7m7 7l-7 7"
              />
            </svg>
          </button>
        </div>
        {!empty && (
          <div className="cs-clear-row">
            <button type="button" className="cs-clear-btn" onClick={onClear}>清空購物車</button>
          </div>
        )}
      </div>

      {empty ? (
        <div className="cs-empty">
          <i className="fa fa-shopping-basket" aria-hidden="true" />
          <div>菜籃是空的</div>
        </div>
      ) : (
        <>
          {/* ── Summary card ── */}
          <div className="cs-info">
            {summaryByType.map(s => {
              const cat = CATEGORIES[s.Type]
              const title = cat?.Title ?? '其他'
              const remaining = Math.max(0, FREIGHT_THRESHOLD - s.Subtotal)
              const displayAmount = s.Subtotal >= FREIGHT_THRESHOLD
                ? s.Subtotal
                : s.Subtotal + FREIGHT_FEE
              const freeShip = remaining === 0
              return (
                <div key={s.Type} className="cs-freight-card">
                  <div className="cs-freight-row">
                    <span>
                      {title}
                      <span className="cs-freight-fee">
                        {freeShip ? '(免運)' : `(含運費$${FREIGHT_FEE})`}
                      </span>
                    </span>
                    <span>NT${displayAmount.toLocaleString()}</span>
                  </div>
                  {!freeShip && (
                    <div className="cs-freight-row cs-freight-warn">
                      <span>離免運門檻尚差</span>
                      <span>${remaining.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )
            })}
            {/* 4.5 贈品提示：放在運費卡 ↔ 總額之間（綠框白底綠字置中） */}
            <CartSidebarGiftNotice hasActiveGiftRules={hasActiveGiftRules} />
            <div className="cs-total-row">
              <span>總額</span>
              <span>NT${total.toLocaleString()}</span>
            </div>
            <button type="button" className="cs-checkout" onClick={onCheckout}>結帳</button>
          </div>

          {/* ── Items grouped by Temperature ── */}
          <div>
            {groupedByTemp.map(tempGroup => (
              <div
                key={tempGroup.TemperatureType}
                className={`cs-item-container ${tempGroup.TempClass}`}
              >
                <div className="cs-temp-heading-wrap">
                  <div className={`cs-temp-heading ${tempGroup.TempClass}`}>
                    {tempGroup.TempLabel}
                  </div>
                </div>
                <div className="cs-temp-body">
                  {tempGroup.TypeGroups.map(typeGroup => (
                    <div key={typeGroup.Type} className="cs-cart-order">
                      <div className="cs-pill-wrap">
                        <h4 className={`cs-pill ${tempGroup.TempClass}`}>
                          {typeGroup.Category?.Title ?? '其他'}專區
                        </h4>
                      </div>
                      <div>
                        {typeGroup.Items.map(it => (
                          <CartSidebarItemRow
                            key={it.uid ?? `${it.ProductId}-${it.ProductDetailId}`}
                            item={it}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function CartSidebarItemRow({ item }) {
  return (
    <div className="cs-item">
      <div className="cs-item-flex">
        <div className="cs-item-img">
          <img src={item.Pic} alt={item.ProductName} />
        </div>
        <div className="cs-item-info">
          <div className={`cs-item-name ${item.SpecSuffix ? 'has-suffix' : ''}`}>
            {item.ProductName}
          </div>
          {item.SpecSuffix && (
            <div className="cs-item-suffix">{item.SpecSuffix.replace(/^[（(]|[)）]$/g, '')}</div>
          )}
          <div className="cs-item-bottom">
            <span>X {item.Quantity}</span>
            <span>${item.Price}</span>
          </div>
        </div>
        <button type="button" className="cs-item-trash" aria-label="移除">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17,4V5H15V4H9V5H7V4A2,2,0,0,1,9,2h6A2,2,0,0,1,17,4Z" />
            <path d="M20,6H4A1,1,0,0,0,4,8H5V20a2,2,0,0,0,2,2H17a2,2,0,0,0,2-2V8h1a1,1,0,0,0,0-2ZM11,17a1,1,0,0,1-2,0V11a1,1,0,0,1,2,0Zm4,0a1,1,0,0,1-2,0V11a1,1,0,0,1,2,0Z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
