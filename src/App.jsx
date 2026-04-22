import { Routes, Route, Navigate } from 'react-router-dom'
import StoreLayout from './layouts/StoreLayout'
import ConfirmOrder from './pages/ConfirmOrder'

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/Orders/ConfirmOrder" element={<ConfirmOrder />} />
        <Route path="/" element={<Navigate to="/Orders/ConfirmOrder" replace />} />
        <Route path="*" element={<Navigate to="/Orders/ConfirmOrder" replace />} />
      </Route>
    </Routes>
  )
}
