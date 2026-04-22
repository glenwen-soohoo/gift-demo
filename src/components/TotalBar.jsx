// 底部商品總金額（不含運費）+ 下一步
// 對齊線上 #ticket-use 底部 .amount_cart-total-title + .next-step
export default function TotalBar({ total }) {
  return (
    <>
      <section className="col-xs-12 base-field order-field-basc" id="ticket-use">
        <div className="col-xs-12" style={{ textAlign: 'right' }}>
          <p className="col-xs-12">
            <span className="amount_cart-total-title">商品總金額：　</span>
            <span id="amount_cart-total">${total}</span> 元
          </p>
        </div>
      </section>
      <section className="col-xs-12 p-0 next-step">
        <button type="button">下一步</button>
      </section>
    </>
  )
}
