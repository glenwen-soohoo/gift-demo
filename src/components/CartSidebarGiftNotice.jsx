// 側欄購物車提示文字（Phase D 新增，對應重構計畫 §4.5）
//
// 情境：側欄 mini cart（CartController.GetCartInfo）因效能因素**不計算**贈品，
//       所以改用這條提示文字通知使用者，贈品活動實際觸發會在結帳頁面進行。
//
// 視覺對齊：跟運費門檻提示卡同款（綠框、白底、綠字、置中、加粗）。
//
// Props：
//   hasActiveGiftRules: bool   — 目前是否有任何上架中的贈品規則；
//                                false 時不 render（避免干擾沒贈品活動時的版面）
export default function CartSidebarGiftNotice({ hasActiveGiftRules }) {
  if (!hasActiveGiftRules) return null
  return (
    <div className="cart-sidebar-gift-notice">
      贈品活動將於結帳頁面自動計算
    </div>
  )
}
