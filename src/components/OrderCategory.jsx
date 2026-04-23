import TopField from './TopField'
import CartItemRow from './CartItemRow'
import CartOrderTotal from './CartOrderTotal'
import SAArea from './SAArea'
import GiftHintRow from './GiftHintRow'

// 一整個分類（冷凍超市 / 粥寶寶 …）：
// top-field + categorey-title + 溫層分組 + 商品列 + 贈品/提示 + 小計+運費 + 超值加購
export default function OrderCategory({
  category, items, saItems,
  giftEvals = [],        // 此分類對應的贈品評估結果
  onChangeQty, onDelete, onAddSa, onToggleGift,
}) {
  // 贈品不算進小計；但 buy_to_get target 算（米餅就是一般商品，要計入小計）
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)

  // 依溫層分組
  const groups = items.reduce((acc, it) => {
    const key = it.temperatureLabel
    if (!acc[key]) acc[key] = []
    acc[key].push(it)
    return acc
  }, {})

  const tempKeys = Object.keys(groups)
  const lastTemp = tempKeys[tempKeys.length - 1]

  // 只在最後一個溫層組末尾加贈品/提示列
  const triggeredGifts = giftEvals.filter(g => g.state === 'triggered')
  const hintGifts      = giftEvals.filter(g => g.state === 'hint')

  return (
    <>
      <TopField />

      <section className="col-xs-12 base-field order-field-basc categorey-title" data-type={category.dataType}>
        <img src={category.icon} alt="" />
        <span>{category.title}</span>
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
              {triggeredGifts.map(ev => (
                <CartItemRow
                  key={`gift-${ev.rule.id}`}
                  item={{ isGift: true }}
                  giftEval={ev}
                  onToggleGift={onToggleGift}
                />
              ))}
              {hintGifts.map(ev => (
                <GiftHintRow key={`hint-${ev.rule.id}`} evaluated={ev} />
              ))}
            </>
          )}
        </div>
      ))}

      <CartOrderTotal category={category} subtotal={subtotal} />

      {saItems && saItems.length > 0 && (
        <SAArea
          saAreaId={category.saAreaId}
          items={saItems}
          onAdd={(saItem, qty) => onAddSa(category.key, saItem, qty)}
        />
      )}
    </>
  )
}
