import { createPortal } from 'react-dom'

// 活動辦法 彈窗 — 只顯示規則設定時輸入的詳細說明文字
// 使用 createPortal 渲染到 document.body，避免祖先有 transform/filter 破壞 fixed 定位
//
// Props（Phase D 對齊）：
//   giftItem: GiftTriggeredItem | GiftHintItem
//     — 都具備 GiftType / PopupText 欄位；hint 走 'Threshold' 顯示
export default function GiftInfoModal({ open, onClose, giftItem }) {
  if (!open || !giftItem) return null
  const { GiftType, PopupText } = giftItem
  const giftTypeClass = GiftType === 'Threshold' ? 'threshold' : 'buy_to_get'
  const tagLabel = GiftType === 'Threshold' ? '滿額贈' : '買就送'

  return createPortal(
    <div className="gift-modal-overlay" onClick={onClose}>
      <div className="gift-modal" onClick={e => e.stopPropagation()}>
        <div className={`gift-modal-header ${giftTypeClass}`}>
          <span className="gift-modal-tag">{tagLabel}</span>
          <span className="gift-modal-title">活動辦法</span>
          <button className="gift-modal-close" onClick={onClose} aria-label="關閉">×</button>
        </div>

        <div className="gift-modal-body">
          <pre className="gm-popup-text">{PopupText || '（尚未設定活動辦法說明）'}</pre>
        </div>

        <div className="gift-modal-footer">
          <button type="button" className="gm-btn" onClick={onClose}>我知道了</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
