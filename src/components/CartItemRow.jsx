import { useState } from 'react'
import GiftInfoModal from './GiftInfoModal'

// 單一購物車商品列 — 支援兩種模式：一般商品 / 贈品
export default function CartItemRow({ item, onChangeQty, onDelete, giftEval, onToggleGift }) {
  const [giftModal, setGiftModal] = useState(false)

  if (item.isGift) {
    return (
      <GiftRow
        giftEval={giftEval}
        onToggleGift={onToggleGift}
        giftModal={giftModal}
        setGiftModal={setGiftModal}
      />
    )
  }

  return (
    <section
      className="col-xs-12 order-field-basc cartItem-area pd-mark"
      data-pid={item.pid}
      data-pdid={item.pdid}
      data-name={item.name}
      data-price={item.price}
      data-variant={item.spec}
    >
      <div className="base-field field-pd col-xs-4">
        <div id="pd-img-fillPaymentInfo" className="col-xs-4 p-0">
          <img src={item.image} alt={item.name} />
        </div>
        <div className="col-xs-8 pd-descs">
          <div className="pd-title">
            {item.name}
            {item.nameWarning && (
              <>
                <br />
                <span style={{ color: 'red', fontSize: '10pt' }}>{item.nameWarning}</span>
              </>
            )}
          </div>
          <div className="pd-spec">
            規格:{item.spec}
            {item.specSuffix && <span> {item.specSuffix}</span>}
          </div>
        </div>
      </div>

      <div className="base-field field-order-time col-xs-2">
        <span>{item.deliveryTime}</span>
      </div>

      <div className="base-field field-price col-xs-1">
        ${item.price}
      </div>

      <div className="base-field field-amt col-xs-2">
        <select
          id={`paymentproductid-${item.pid}-${item.pdid}`}
          className={`form-control paymentproductid-${item.pid}`}
          value={item.quantity}
          onChange={e => onChangeQty(item.uid, Number(e.target.value))}
          style={{ width: 65, margin: 'auto', textAlign: 'center', display: 'inline' }}
        >
          {Array.from({ length: Math.min(item.maxQty ?? 12, 12) }, (_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <div className="amt-alert">剩餘 {item.maxQty} 組</div>
      </div>

      <div className="base-field field-pd-total col-xs-2">
        <div className="order-p-unit order-content-price" style={{ textDecoration: 'none' }}>
          ${item.price * item.quantity}
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

// ─── 贈品列 ───
function GiftRow({ giftEval, onToggleGift, giftModal, setGiftModal }) {
  const { rule, declined, qty: evalQty, multiplier } = giftEval
  const gift = rule.gift
  const qty = evalQty ?? gift.quantity

  return (
    <>
      <section
        className={`col-xs-12 order-field-basc cartItem-area gift-row ${rule.giftType} ${declined ? 'declined' : ''}`}
        data-pid={gift.pid}
        data-pdid={gift.pdid}
      >
        <div className="base-field field-pd col-xs-4">
          <div id="pd-img-fillPaymentInfo" className="col-xs-4 p-0">
            <img src={gift.image} alt={gift.name} />
          </div>
          <div className="col-xs-8 pd-descs">
            <div className="gift-tags">
              <span className={`gift-tag ${rule.giftType}`}>
                {rule.giftType === 'threshold' ? '滿額贈' : '買就送'}
              </span>
              <button type="button" className="gift-info-btn" onClick={() => setGiftModal(true)}>
                活動說明
              </button>
            </div>
            <div className="pd-title">{gift.name}</div>
            <div className="pd-spec">
              規格:{gift.spec}
              {gift.specSuffix && <span> {gift.specSuffix}</span>}
            </div>
          </div>
        </div>

        <div className="base-field field-order-time col-xs-2">
          <span>{gift.deliveryTime}</span>
        </div>

        <div className="base-field field-price col-xs-1 gift-price">
          贈品
        </div>

        <div className="base-field field-amt col-xs-2">
          <div className="gift-qty">{declined ? 0 : qty}</div>
        </div>

        <div className="base-field field-pd-total col-xs-2">
          <div className="order-p-unit order-content-price gift-total">
            $0
          </div>
        </div>

        <div className="base-field field-delete col-xs-1">
          <button
            type="button"
            className={`gift-toggle-btn ${declined ? 'restore' : 'decline'}`}
            onClick={() => onToggleGift?.(rule.id)}
            title={declined ? '加回贈品' : '不要贈品'}
          >
            {declined ? '加回贈品' : '不要贈品'}
          </button>
        </div>
      </section>

      <GiftInfoModal open={giftModal} onClose={() => setGiftModal(false)} rule={rule} />
    </>
  )
}
