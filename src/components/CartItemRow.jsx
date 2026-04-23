import { useState } from 'react'
import GiftInfoModal from './GiftInfoModal'

// 單一購物車商品列 — 支援兩種模式：一般商品 / 贈品
//
// 贈品模式：
//   item = { IsGift: true }  （flag）
//   giftItem = GiftTriggeredItem（從 CartGiftResult.Triggered 拿）
export default function CartItemRow({ item, onChangeQty, onDelete, giftItem, onToggleGift }) {
  const [giftModal, setGiftModal] = useState(false)

  if (item.IsGift) {
    return (
      <GiftRow
        giftItem={giftItem}
        onToggleGift={onToggleGift}
        giftModal={giftModal}
        setGiftModal={setGiftModal}
      />
    )
  }

  return (
    <section
      className="col-xs-12 order-field-basc cartItem-area pd-mark"
      data-pid={item.ProductId}
      data-pdid={item.ProductDetailId}
      data-name={item.ProductName}
      data-price={item.Price}
      data-variant={item.ProductSpec}
    >
      <div className="base-field field-pd col-xs-4">
        <div id="pd-img-fillPaymentInfo" className="col-xs-4 p-0">
          <img src={item.Pic} alt={item.ProductName} />
        </div>
        <div className="col-xs-8 pd-descs">
          <div className="pd-title">
            {item.ProductName}
            {item.NameWarning && (
              <>
                <br />
                <span style={{ color: 'red', fontSize: '10pt' }}>{item.NameWarning}</span>
              </>
            )}
          </div>
          <div className="pd-spec">
            規格:{item.ProductSpec}
            {item.SpecSuffix && <span> {item.SpecSuffix}</span>}
          </div>
        </div>
      </div>

      <div className="base-field field-order-time col-xs-2">
        <span>{item.DeliveryTime}</span>
      </div>

      <div className="base-field field-price col-xs-1">
        ${item.Price}
      </div>

      <div className="base-field field-amt col-xs-2">
        <select
          id={`paymentproductid-${item.ProductId}-${item.ProductDetailId}`}
          className={`form-control paymentproductid-${item.ProductId}`}
          value={item.Quantity}
          onChange={e => onChangeQty(item.uid, Number(e.target.value))}
          style={{ width: 65, margin: 'auto', textAlign: 'center', display: 'inline' }}
        >
          {Array.from({ length: Math.min(item.MaxQty ?? 12, 12) }, (_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <div className="amt-alert">剩餘 {item.MaxQty} 組</div>
      </div>

      <div className="base-field field-pd-total col-xs-2">
        <div className="order-p-unit order-content-price" style={{ textDecoration: 'none' }}>
          ${item.Price * item.Quantity}
        </div>
      </div>

      <div className="base-field field-delete col-xs-1">
        <a
          href="#"
          onClick={e => {
            e.preventDefault()
            onDelete(item.uid)
          }}
        >
          <i className="fa fa-trash" style={{ fontSize: 26 }} />
        </a>
      </div>
    </section>
  )
}

// ─── 贈品列（讀取 GiftTriggeredItem）───────────────
function GiftRow({ giftItem, onToggleGift, giftModal, setGiftModal }) {
  if (!giftItem) return null
  const {
    GiftRuleId, ProductId, ProductDetailId, ProductName, ProductSpec, SpecSuffix,
    Pic, DeliveryTime, GiftType, Quantity, IsDeclined,
  } = giftItem

  const tagLabel = GiftType === 'Threshold' ? '滿額贈' : '買就送'
  const giftTypeClass = GiftType === 'Threshold' ? 'threshold' : 'buy_to_get'
  const displayQty = IsDeclined ? 0 : Quantity

  return (
    <>
      <section
        className={`col-xs-12 order-field-basc cartItem-area gift-row ${giftTypeClass} ${IsDeclined ? 'declined' : ''}`}
        data-pid={ProductId}
        data-pdid={ProductDetailId}
      >
        <div className="base-field field-pd col-xs-4">
          <div id="pd-img-fillPaymentInfo" className="col-xs-4 p-0">
            <img src={Pic} alt={ProductName} />
          </div>
          <div className="col-xs-8 pd-descs">
            <div className="gift-tags">
              <span className={`gift-tag ${giftTypeClass}`}>{tagLabel}</span>
              <button type="button" className="gift-info-btn" onClick={() => setGiftModal(true)}>
                活動說明
              </button>
            </div>
            <div className="pd-title">{ProductName}</div>
            <div className="pd-spec">
              規格:{ProductSpec}
              {SpecSuffix && <span> {SpecSuffix}</span>}
            </div>
          </div>
        </div>

        <div className="base-field field-order-time col-xs-2">
          <span>{DeliveryTime}</span>
        </div>

        <div className="base-field field-price col-xs-1 gift-price">
          贈品
        </div>

        <div className="base-field field-amt col-xs-2">
          <div className="gift-qty">{displayQty}</div>
        </div>

        <div className="base-field field-pd-total col-xs-2">
          <div className="order-p-unit order-content-price gift-total">
            $0
          </div>
        </div>

        <div className="base-field field-delete col-xs-1">
          <button
            type="button"
            className={`gift-toggle-btn ${IsDeclined ? 'restore' : 'decline'}`}
            onClick={() => onToggleGift?.(GiftRuleId)}
            title={IsDeclined ? '加回贈品' : '不要贈品'}
          >
            {IsDeclined ? '加回贈品' : '不要贈品'}
          </button>
        </div>
      </section>

      <GiftInfoModal open={giftModal} onClose={() => setGiftModal(false)} giftItem={giftItem} />
    </>
  )
}
