import { Link } from 'react-router-dom'

// Demo 入口：選前台或後台
export default function Home() {
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

        <div className="home-notes">
          <strong>Demo 說明：</strong>
          所有資料存 localStorage，重整瀏覽器不會消失；若要重置，請到 DevTools Application 清除 <code>gift-demo:*</code> keys。
        </div>
      </div>
    </div>
  )
}
