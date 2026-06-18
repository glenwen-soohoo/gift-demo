import { createPortal } from 'react-dom'

// 贈品說明 彈窗 — 顯示活動辦法文字；若帶有贈品商品資訊（圖片 / 名稱 / 規格 / 數量）則一併顯示
// 使用 createPortal 渲染到 document.body，避免祖先有 transform/filter 破壞 fixed 定位
//
// Props：
//   giftItem: 至少具備 GiftType / PopupText
//     — 結帳頁購物車（GiftTriggeredItem / GiftHintItem）只帶這兩個欄位 → 只顯示活動辦法
//     — 商品頁額外帶 Pic / ProductName / ProductSpec / SpecSuffix / GiftQuantity
//       → 多顯示一塊「贈品商品」（解決客人看不到贈品長相的問題）
export default function GiftInfoModal({ open, onClose, giftItem }) {
  if (!open || !giftItem) return null
  const { GiftType, PopupText, DetailText, Pic, ProductName, ProductSpec, SpecSuffix } = giftItem
  const giftTypeClass = GiftType === 'Threshold' ? 'threshold' : 'buy_to_get'
  const tagLabel = GiftType === 'Threshold' ? '滿額贈' : '買就送'
  const hasProduct = Boolean(Pic || ProductName)
  const modalTitle = hasProduct ? '贈品說明' : '活動辦法'
  const specText = [ProductSpec, SpecSuffix].filter(Boolean).join(' ')
  // 彈窗顯示「完整活動細則」DetailText；舊資料只有 PopupText 時退回沿用
  const bodyText = DetailText || PopupText || '（尚未設定活動辦法說明）'

  return createPortal(
    <div className="gift-modal-overlay" onClick={onClose}>
      <div className="gift-modal" onClick={e => e.stopPropagation()}>
        <div className={`gift-modal-header ${giftTypeClass}`}>
          <span className="gift-modal-tag">{tagLabel}</span>
          <span className="gift-modal-title">{modalTitle}</span>
          <button className="gift-modal-close" onClick={onClose} aria-label="關閉">×</button>
        </div>

        <div className="gift-modal-body">
          {hasProduct && (
            <div className="gift-modal-section">
              <div className="gm-section-title">贈送品項</div>
              <div className="gift-modal-product">
                {Pic && <img src={Pic} alt={ProductName || '贈品'} />}
                <div>
                  {ProductName && <div className="gm-name">{ProductName}</div>}
                  {specText && <div className="gm-spec">{specText}</div>}
                </div>
              </div>
            </div>
          )}

          <div className="gift-modal-section">
            {hasProduct && <div className="gm-section-title">活動辦法</div>}
            <pre className="gm-popup-text">{bodyText}</pre>
          </div>
        </div>

        <div className="gift-modal-footer">
          <button type="button" className="gm-btn" onClick={onClose}>我知道了</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
