import TopField from './TopField'
import CartItemRow from './CartItemRow'
import CartOrderTotal from './CartOrderTotal'
import SAArea from './SAArea'

// 一整個分類（冷凍超市 / 粥寶寶 …）：
// top-field + categorey-title + 溫層分組 + 商品列 + 小計+運費 + 超值加購
export default function OrderCategory({ category, items, saItems, onChangeQty, onDelete, onAddSa }) {
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)

  // 依溫層分組
  const groups = items.reduce((acc, it) => {
    const key = it.temperatureLabel
    if (!acc[key]) acc[key] = []
    acc[key].push(it)
    return acc
  }, {})

  return (
    <>
      <TopField />

      <section className="col-xs-12 base-field order-field-basc categorey-title" data-type={category.dataType}>
        <img src={category.icon} alt="" />
        <span>{category.title}</span>
      </section>

      {Object.entries(groups).map(([tempLabel, tempItems]) => (
        <div key={tempLabel}>
          <div
            className="col-xs-12 order-field-basc"
            style={{ fontWeight: 'bolder', backgroundColor: 'white', fontSize: '1.3em', padding: 13 }}
          >
            <span>{tempLabel}</span>
          </div>
          {tempItems.map(item => (
            <CartItemRow
              key={item.uid}
              item={item}
              onChangeQty={onChangeQty}
              onDelete={onDelete}
            />
          ))}
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
