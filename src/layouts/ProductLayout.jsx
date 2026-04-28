import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

// 產品內頁不走訂單結帳的 PageTop step indicator，
// 也不走灰底 sb-site-container（線上產品頁是白底）
// 只用 Header + Footer + 純 Bootstrap container 包住內容
export default function ProductLayout() {
  return (
    <>
      <Header />
      <div className="pd-page-wrap">
        <div className="container p-0" id="app">
          <Outlet />
        </div>
      </div>
      <Footer />
    </>
  )
}
