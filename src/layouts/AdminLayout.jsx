import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

// 比照 Figma 後台介面：深色側欄 + 淺綠 header + breadcrumb + 主內容
const MENU_ITEMS = [
  { key: 'account',   label: '帳號管理',   disabled: true },
  { key: 'member',    label: '會員管理',   disabled: true },
  { key: 'todo',      label: '待辦事項',   disabled: true },
  { key: 'warehouse', label: '倉庫待辦',   disabled: true, badge: 4 },
  { key: 'customer',  label: '客服待辦',   disabled: true, badge: 1 },
  { key: 'article',   label: '文章管理',   disabled: true },
  {
    key: 'product',
    label: '產品管理',
    expanded: false,
    children: [
      { key: 'products/69928', label: '產品編輯 (demo)', link: '/admin/products/69928' },
    ],
  },
  { key: 'order',     label: '訂單管理',   disabled: true },
  { key: 'ai',        label: 'AI應用工具', disabled: true },
  {
    key: 'web',
    label: '網頁管理',
    expanded: true,
    children: [
      { key: 'gifts', label: '贈品設定', link: '/admin/gifts' },
    ],
  },
  { key: 'live',      label: '直播功能',   disabled: true },
  { key: 'msg',       label: '留言管理',   disabled: true, badge: 2 },
  { key: 'after',     label: '售後服務',   disabled: true, badge: 15 },
  { key: 'coupon',    label: '折扣碼管理', disabled: true },
  { key: 'shipping',  label: '運費管理',   disabled: true },
  { key: 'vip',       label: '等家寶寶',   disabled: true },
  { key: 'purchase',  label: '採購專區',   disabled: true },
  { key: 'kpi',       label: 'KPI',       disabled: true },
  { key: 'group',     label: '團購專區',   disabled: true },
  { key: 'baby',      label: '粥寶寶專區', disabled: true },
  { key: 'info',      label: '訊息管理',   disabled: true },
  { key: 'safety',    label: '安心日報管理', disabled: true },
]

export default function AdminLayout() {
  const loc = useLocation()
  const isGiftEdit = /\/admin\/gifts\/(new|\d+)$/.test(loc.pathname)
  const isProduct = loc.pathname.startsWith('/admin/products')

  return (
    <div className="admin-page">
      {/* header */}
      <header className="admin-header">
        <Link to="/" className="admin-logo">
          <img src="https://greenboxcdn.azureedge.net/images/logo-small.png" alt="無毒農" />
        </Link>
        <nav className="admin-breadcrumb">
          {isProduct ? (
            <>
              <span>產品管理</span>
              <span className="sep">&gt;</span>
              <strong>編輯</strong>
            </>
          ) : (
            <>
              <span>網頁管理</span>
              <span className="sep">&gt;</span>
              {isGiftEdit ? (
                <>
                  <Link to="/admin/gifts">贈品列表</Link>
                  <span className="sep">&gt;</span>
                  <strong>贈送條件設定</strong>
                </>
              ) : (
                <strong>贈品列表</strong>
              )}
            </>
          )}
        </nav>
      </header>

      <div className="admin-body">
        {/* sidebar */}
        <aside className="admin-sidebar">
          {MENU_ITEMS.map(m => (
            <MenuItem key={m.key} item={m} currentPath={loc.pathname} />
          ))}
        </aside>

        {/* content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function MenuItem({ item, currentPath }) {
  const [open, setOpen] = useState(item.expanded ?? false)
  if (item.children) {
    return (
      <div className={`menu-group ${open ? 'open' : ''}`}>
        <button type="button" className="menu-title" onClick={() => setOpen(o => !o)}>
          <span className="arrow">{open ? '▼' : '▶'}</span>
          <span>{item.label}</span>
        </button>
        {open && (
          <div className="menu-children">
            {item.children.map(c => (
              <Link
                key={c.key}
                to={c.link}
                className={`menu-child ${currentPath.startsWith(c.link) ? 'active' : ''}`}
              >{c.label}</Link>
            ))}
          </div>
        )}
      </div>
    )
  }
  return (
    <div className={`menu-item ${item.disabled ? 'disabled' : ''}`}>
      <span className="arrow">▶</span>
      <span className="label">{item.label}</span>
      {item.badge && <span className="badge">{item.badge}</span>}
    </div>
  )
}
