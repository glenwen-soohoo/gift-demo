import { Routes, Route } from 'react-router-dom'
import StoreLayout from './layouts/StoreLayout'
import ProductLayout from './layouts/ProductLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import ConfirmOrder from './pages/ConfirmOrder'
import ProductDetail from './pages/ProductDetail'
import AdminGiftList from './pages/admin/AdminGiftList'
import AdminGiftEdit from './pages/admin/AdminGiftEdit'
import AdminProductEdit from './pages/admin/AdminProductEdit'

export default function App() {
  return (
    <Routes>
      {/* 入口 */}
      <Route path="/" element={<Home />} />

      {/* 前台：訂單結帳（PageTop step indicator） */}
      <Route element={<StoreLayout />}>
        <Route path="/Orders/ConfirmOrder" element={<ConfirmOrder />} />
      </Route>

      {/* 前台：產品內頁（無 step indicator） */}
      <Route element={<ProductLayout />}>
        <Route path="/Products/ItemDetail/:id" element={<ProductDetail />} />
      </Route>

      {/* 後台 */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="gifts" element={<AdminGiftList />} />
        <Route path="gifts/:id" element={<AdminGiftEdit />} />
        <Route path="products/:id" element={<AdminProductEdit />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
