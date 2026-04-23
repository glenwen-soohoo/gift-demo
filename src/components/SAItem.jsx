import { useState } from 'react'

// 單一加購商品 — 仿線上 .sa-pd-slick-frozen > .col-xs-12 結構
// Props（Phase D）：item 用 PascalCase 欄位
export default function SAItem({ item, onAdd }) {
  const [qty, setQty] = useState(1)

  return (
    <div
      className="col-xs-12"
      data-ispop="false"
      data-pid={item.ProductId}
      data-pdid={item.ProductDetailId}
      data-category="冷凍專區/超值加購"
      data-name={item.ProductName}
      data-variant="1包"
      data-pageview="訂單確認頁"
      data-price={item.DiscountPrice}
    >
      <div>
        <img src={item.Pic} alt={item.ProductName} />
      </div>
      <div className="col-xs-12 p-0 m-t-5 pd-title slick-pd-hight" style={{ minHeight: '6em' }}>
        <span className="temperature_layer_icon_3">{item.TemperatureTypeName}</span> {item.ProductName}
      </div>

      <div className="col-xs-12 m-t-10 p-0">
        <div className="col-xs-12 col-md-6 p-0 price-area">
          原價 <span style={{ textDecoration: 'line-through' }}>{item.OriginPrice}</span>
        </div>
        <div className="col-xs-12 col-md-6 p-0 dis-price-area">
          加購價
          <span className="DiscountPrice">{item.DiscountPrice}</span> 元
        </div>
      </div>

      <div className="col-xs-12 m-t-10 p-0">
        <div className="col-xs-12 col-md-6 p-0">
          <span className="amt-name">數量</span>
          <select
            className="saDropdown form-control"
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
          >
            <option value="1">1</option>
          </select>
        </div>
        <div className="col-xs-12 col-md-6 p-0">
          <button
            type="button"
            className="buybutton"
            onClick={() => onAdd(item, qty)}
          >
            <div className="content">
              <i className="fa fa-shopping-basket" /> 加入菜籃
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
