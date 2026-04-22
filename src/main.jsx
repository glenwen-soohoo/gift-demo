import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { GiftRulesProvider } from './context/GiftRulesContext'
import { ProductProvider } from './context/ProductContext'
import './index.css'
import './admin.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ProductProvider>
        <GiftRulesProvider>
          <App />
        </GiftRulesProvider>
      </ProductProvider>
    </BrowserRouter>
  </StrictMode>,
)
