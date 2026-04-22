import { member, navLinks } from '../data/fakeData'

const LOGO = 'https://fruitbox.blob.core.windows.net/pagematerials/shared/2022_logo.svg'
const VIP_ICON = 'https://fruitbox.blob.core.windows.net/pagematerials/home/about-Vip/2023/smallNormal.svg'

export default function Header() {
  return (
    <header className="gb-head">
      <div className="top-bar">
        <div className="logo-wrap">
          <a href="/">
            <img src={LOGO} alt="無毒農，友善環境的安心水果" />
          </a>
        </div>

        <div className="search-box">
          <i className="fa fa-search" />
          <input type="text" placeholder="請輸入關鍵字" />
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a className="member-wrap-link" href="/Volunteers/Orders">
            <img src={VIP_ICON} width="16" alt="" />
            {member.name}　|　會員中心　|
          </a>
          <a className="member-wrap-link" href="/Login/Off">登出</a>
          <button className="cart-btn" type="button">
            <i className="fa fa-shopping-basket" />
            <span className="badge">3</span>
          </button>
        </div>
      </div>

      <nav className="nav-row">
        {navLinks.map((n, i) => (
          <a key={i} href="#">
            {n.newBadge && <span className="new-badge">NEW!</span>}
            {n.newBadge ? n.label.replace('NEW!', '') : n.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
