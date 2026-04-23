import { createPortal } from 'react-dom'

// 活動辦法 彈窗 — 只顯示規則設定時輸入的詳細說明文字
// 使用 createPortal 渲染到 document.body，避免祖先有 transform/filter 破壞 fixed 定位
export default function GiftInfoModal({ open, onClose, rule }) {
  if (!open || !rule) return null
  const { giftType, popupText } = rule

  return createPortal(
    <div className="gift-modal-overlay" onClick={onClose}>
      <div className="gift-modal" onClick={e => e.stopPropagation()}>
        <div className={`gift-modal-header ${giftType}`}>
          <span className="gift-modal-tag">{giftType === 'threshold' ? '滿額贈' : '買就送'}</span>
          <span className="gift-modal-title">活動辦法</span>
          <button className="gift-modal-close" onClick={onClose} aria-label="關閉">×</button>
        </div>

        <div className="gift-modal-body">
          <pre className="gm-popup-text">{popupText || '（尚未設定活動辦法說明）'}</pre>
        </div>

        <div className="gift-modal-footer">
          <button type="button" className="gm-btn" onClick={onClose}>我知道了</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
