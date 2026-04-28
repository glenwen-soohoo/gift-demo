import { Link } from 'react-router-dom'
import { useGiftRules } from '../context/GiftRulesContext'
import { GIFT_RULE_STATE } from '../data/giftRules'
import { initialCart } from '../data/fakeData'
import CartSidebar from '../components/CartSidebar'

// Demo 入口：選前台或後台
export default function Home() {
  const { rules } = useGiftRules()

  // 對齊 fruit_web 的 `HasActiveGiftRules` 旗標（單純判斷有無上架中規則）
  const hasActiveGiftRules = rules.some(r => r.State === GIFT_RULE_STATE.上架中)

  // 從 initialCart 取樣 3 筆品項用來示範側邊購物車長相
  const sidebarItems = initialCart.flatMap(c => c.Items).slice(0, 3)

  return (
    <div className="home-page">
      <div className="home-wrap">
        <div className="home-hero">
          <img src="https://greenboxcdn.azureedge.net/images/logo-small.png" alt="" className="home-logo" />
          <h1>贈品系統 Demo</h1>
          <p className="home-subtitle">
            基於 <a href="https://greenbox.tw" target="_blank" rel="noreferrer">greenbox.tw</a> 訂單結帳頁復刻、<br />
            搭配「贈品管理」後台 — 前後台互動的狀態機 Demo
          </p>
        </div>

        <div className="home-entries">
          <Link to="/Orders/ConfirmOrder" className="entry-card entry-front">
            <div className="entry-icon">🛒</div>
            <div className="entry-body">
              <h2>前台：訂單確認頁</h2>
              <p>商品可改數量 / 刪除 / 加購品可加入購物車</p>
              <div className="entry-url">/Orders/ConfirmOrder</div>
            </div>
          </Link>

          <Link to="/Products/ItemDetail/75762" className="entry-card entry-front">
            <div className="entry-icon">🍪</div>
            <div className="entry-body">
              <h2>前台：產品內頁（米餅）</h2>
              <p>「買就送活動資訊」放在出貨日期下方、規格選擇上方</p>
              <div className="entry-url">/Products/ItemDetail/75762</div>
            </div>
          </Link>

          <Link to="/admin/gifts" className="entry-card entry-admin">
            <div className="entry-icon">🎁</div>
            <div className="entry-body">
              <h2>後台：贈品管理</h2>
              <p>贈品列表查詢 / 編輯贈送條件（滿額贈・買就送）</p>
              <div className="entry-url">/admin/gifts</div>
            </div>
          </Link>

          <Link to="/admin/products/69928" className="entry-card entry-admin">
            <div className="entry-icon">📦</div>
            <div className="entry-body">
              <h2>後台：產品規格編輯</h2>
              <p>編輯產品規格、勾選「設為贈品」（贈品規格來源）</p>
              <div className="entry-url">/admin/products/69928</div>
            </div>
          </Link>
        </div>

        {/* 側邊購物車 1:1 復刻（對齊 4.5 決策：側欄不計算贈品） */}
        <div className="home-sidebar-demo">
          <div className="home-sidebar-demo-title">
            🛒 側邊購物車示範（1:1 復刻 greenbox.tw sidebar cart）
            <span className="home-sidebar-demo-sub">
              （側欄不計算贈品，靠底部提示文字告訴客人到結帳頁觸發）
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CartSidebar
              items={sidebarItems}
              hasActiveGiftRules={hasActiveGiftRules}
            />
          </div>
          <div className="home-sidebar-demo-note">
            {hasActiveGiftRules
              ? '↑ 目前 context 有上架中贈品規則，底部顯示提示文字'
              : '↑ 目前無上架中贈品規則，提示文字隱藏'}
          </div>
        </div>

        <div className="home-notes">
          <strong>Demo 說明：</strong>
          所有資料存 localStorage（v2 = PascalCase 對齊 fruit_web），重整瀏覽器不會消失；若要重置，請到 DevTools Application 清除 <code>gift-demo:*</code> keys。
        </div>
      </div>
    </div>
  )
}
