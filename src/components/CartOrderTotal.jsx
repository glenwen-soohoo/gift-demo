// 小計 + 運費 hint — 仿線上 .cart-order-totel 結構
// Props（Phase D）：category 欄位用 PascalCase（FreightThreshold / FreightFee / FreightLabel / FreightLink / DataType）
export default function CartOrderTotal({ category, subtotal }) {
  const remaining = Math.max(0, category.FreightThreshold - subtotal)
  const freightHintText = remaining > 0
    ? `${category.FreightLabel}運費為${category.FreightFee}元，如滿${category.FreightThreshold}元可享免運優惠`
    : `${category.FreightLabel}滿${category.FreightThreshold}免運優惠！`

  return (
    <section className="col-xs-12 order-field-basc cart-order-totel" data-type={category.DataType}>
      <div className="col-xs-12 content">
        <div className="col-xs-9" />
        <div className="base-field field-pd-total col-xs-2 p-0">小 &nbsp;&nbsp; 計</div>
        <div className="base-field field-delete col-xs-1 cartorder_statistics-money" data-price={subtotal}>
          ${subtotal}
        </div>
      </div>
      <div className="col-xs-12 content">
        <div className="col-xs-9" />
        <div>
          <a className="noteFreeFreight" href={category.FreightLink}>
            <span>{freightHintText}</span>
            {remaining > 0 && <div>(尚差{remaining}.0)</div>}
          </a>
        </div>
      </div>
    </section>
  )
}
