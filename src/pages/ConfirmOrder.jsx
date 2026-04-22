import { useEffect, useRef, useState } from 'react'

// 中間內容：直接渲染從 https://greenbox.tw/Orders/ConfirmOrder 下載下來的 HTML 片段
const FRAGMENT_URL = `${import.meta.env.BASE_URL}fragments/confirm-body.html`

export default function ConfirmOrder() {
  const [html, setHtml] = useState('')
  const rootRef = useRef(null)

  useEffect(() => {
    fetch(FRAGMENT_URL)
      .then(r => r.text())
      .then(setHtml)
  }, [])

  // 線上 JS 會把 #sa-model-frozen 移到 #sa-frozen-target、#sa-model-babyfood 移到 #sa-babyfood-target
  // 這裡仿照行為，在 HTML 插入後把 SA section 搬進對應 target
  useEffect(() => {
    if (!html || !rootRef.current) return
    const moves = [
      { from: '#sa-model-frozen',   to: '#sa-frozen-target' },
      { from: '#sa-model-babyfood', to: '#sa-babyfood-target' },
    ]
    for (const { from, to } of moves) {
      const src = rootRef.current.querySelector(from)
      const tgt = rootRef.current.querySelector(to)
      if (src && tgt) {
        while (src.firstChild) tgt.appendChild(src.firstChild)
      }
    }
  }, [html])

  return <div ref={rootRef} dangerouslySetInnerHTML={{ __html: html }} />
}
