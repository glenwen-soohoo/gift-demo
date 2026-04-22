// 欄位標頭 — 商品 / 出貨時間 / 單價 / 數量 / 總計 / 刪除
export default function TopField() {
  return (
    <section className="col-xs-12 order-field-basc top-field">
      <div className="base-field field-pd col-xs-4">商品</div>
      <div className="base-field field-order-time col-xs-2">出貨時間</div>
      <div className="base-field field-price col-xs-1">單價</div>
      <div className="base-field field-amt col-xs-2">數量</div>
      <div className="base-field field-pd-total col-xs-2">總計</div>
      <div className="base-field field-delete col-xs-1">刪除</div>
    </section>
  )
}
