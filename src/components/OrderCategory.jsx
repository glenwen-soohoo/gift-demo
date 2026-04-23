import TopField from './TopField'
import CartItemRow from './CartItemRow'
import CartOrderTotal from './CartOrderTotal'
import SAArea from './SAArea'
import GiftHintRow from './GiftHintRow'

// 一整個分類（冷凍超市 / 粥寶寶 …）：
// top-field + categorey-title + 溫層分組 + 商品列 + 贈品/提示 + 小計+運費 + 超值加購
//
// Props（Phase D 對齊 PascalCase）：
//   category:       CATEGORIES[Type] 的元素（Title / Icon / SaAreaId …）
//   items:          CartOrderItem[]（扁平）
//   saItems:        SA_AREAS[...].Items
//   triggeredGifts: GiftTriggeredItem[]
//   hintGifts:      GiftHintItem[]
export default function OrderCategory({
  category, items, saItems,
  triggeredGifts = [], hintGifts = [],
  onChangeQty, onDelete, onAddSa, onToggleGift,
}) {
  // 贈品不算進小計；但 buy_to_get target 算（米餅就是一般商品，要計入小計）
  const subtotal = items.reduce((s, it) => s + it.Price * it.Quantity, 0)

  // 依溫層顯示名稱分組
  const groups = items.reduce((acc, it) => {
    const key = it.TemperatureTypeName
    if (!acc[key]) acc[key] = []
    acc[key].push(it)
    return acc
  }, {})

  const tempKeys = Object.keys(groups)
  const lastTemp = tempKeys[tempKeys.length - 1]

  return (
    <>
      <TopField />

      <section className="col-xs-12 base-field order-field-basc categorey-title" data-type={category.DataType}>
        <img src={category.Icon} alt="" />
        <span>{category.Title}</span>
      </section>

      {tempKeys.map(tempLabel => (
        <div key={tempLabel}>
          <div
            className="col-xs-12 order-field-basc"
            style={{ fontWeight: 'bolder', backgroundColor: 'white', fontSize: '1.3em', padding: 13 }}
          >
            <span>{tempLabel}</span>
          </div>
          {groups[tempLabel].map(item => (
            <CartItemRow
              key={item.uid}
              item={item}
              onChangeQty={onChangeQty}
              onDelete={onDelete}
            />
          ))}

          {/* 觸發的贈品列 + 提示列 — 掛在最後一個溫層組的最下方 */}
          {tempLabel === lastTemp && (
            <>
              {triggeredGifts.map(gift => (
                <CartItemRow
                  key={`gift-${gift.GiftRuleId}`}
                  item={{ IsGift: true }}
                  giftItem={gift}
                  onToggleGift={onToggleGift}
                />
              ))}
              {hintGifts.map(hint => (
                <GiftHintRow key={`hint-${hint.GiftRuleId}`} hint={hint} />
              ))}
            </>
          )}
        </div>
      ))}

      <CartOrderTotal category={category} subtotal={subtotal} />

      {saItems && saItems.length > 0 && (
        <SAArea
          saAreaId={category.SaAreaId}
          items={saItems}
          onAdd={(saItem, qty) => onAddSa(category.Type, saItem, qty)}
        />
      )}
    </>
  )
}
