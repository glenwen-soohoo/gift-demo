import { useParams } from 'react-router-dom'
import { useProducts } from '../../context/ProductContext'

// 後台「產品編輯 - 規格設定」頁
// 參照 https://greenbox.tw/GoX/Product/Edit18/:id 下載的 HTML 實際 DOM 重建
// 真實系統用 Ant Design 5 + Tailwind，這裡用純 CSS 模擬視覺

export default function AdminProductEdit() {
  const { id } = useParams()
  const productId = Number(id ?? 69928)
  const { products, updateSpec, addSpec, removeSpec } = useProducts()
  const product = products[productId]

  if (!product) {
    return <div style={{ padding: 24 }}>找不到產品 #{productId}。</div>
  }

  return (
    <div>
      <section id="product-detail-settings">
        {/* Header 列 */}
        <div className="pd-head">
          <div className="pd-head-title">
            <div className="pd-title-main">規格設定</div>
            <div className="pd-title-sub">如規格有銷量則無法刪除</div>
          </div>
          <div className="pd-head-tabs">
            <div className="pd-tab active">隱藏下架</div>
            <div className="pd-tab">顯示全部</div>
          </div>
        </div>

        {/* 規格 list */}
        <div className="pd-specs">
          {product.specs.map((spec, idx) => (
            <SpecRow
              key={spec.id}
              spec={spec}
              index={idx}
              onChange={(patch) => updateSpec(productId, spec.id, patch)}
              onRemove={() => removeSpec(productId, spec.id)}
            />
          ))}

          {/* 底部 + 新增按鈕 */}
          <div className="pd-add-row">
            <div className="pd-live-box">
              <span className="star">*</span>直播場次
              <select className="pd-select w-400">
                <option>請選擇直播場次</option>
              </select>
              <span className="star ms">*</span>標號
              <input className="pd-input w-100" placeholder="標號" />
              <button type="button" className="pd-btn pd-btn-primary">儲存標號</button>
            </div>
            <button
              type="button"
              className="pd-add-btn"
              onClick={() => addSpec(productId)}
              aria-label="新增規格"
            >＋</button>
          </div>
        </div>
      </section>
    </div>
  )
}

function SpecRow({ spec, index, onChange, onRemove }) {
  const locked = spec.isGift

  const set = (key) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked :
              e.target.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) :
              e.target.value
    onChange({ [key]: v })
  }

  const toggleGift = (e) => {
    const next = e.target.checked
    const patch = { isGift: next }
    if (next) {
      // 設為贈品 → 清空 / 關閉互斥欄位
      patch.isSpecial = false
      patch.isCOD = false
      patch.isSubscription = false
      patch.thresholdAmount = 0
      patch.limitQuantity = 0
      patch.originPrice = 0
      patch.discountPrice = 0
      if (!spec.description) patch.description = '贈品'
    }
    onChange(patch)
  }

  return (
    <div className={`pd-spec-card ${locked ? 'is-gift' : ''}`}>
      {/* Row 1: 規格排序 + 規格 ID + 主要欄位 */}
      <div className="pd-row-1">
        <div className="pd-col pd-col-sort">
          <Label required>規格排序</Label>
          <input type="number" className="pd-input" value={spec.sort} onChange={set('sort')} />
          <div className="pd-spec-id">規格 ID: {spec.id}</div>
        </div>

        <div className="pd-grid-10 grow">
          <div className="pd-col col-span-2">
            <Label>規格描述</Label>
            <input type="text" className="pd-input" value={spec.description} onChange={set('description')} />
          </div>
          <div className="pd-col">
            <Label required>規格量</Label>
            <input type="number" className="pd-input" value={spec.quantity} onChange={set('quantity')} />
          </div>
          <div className="pd-col">
            <Label required>單位</Label>
            <select className="pd-select" value={spec.unit} onChange={set('unit')}>
              <option value="個">個</option>
              <option value="組">組</option>
              <option value="包">包</option>
              <option value="盒">盒</option>
              <option value="張">張</option>
              <option value="次">次</option>
            </select>
          </div>
          <div className="pd-col">
            <Label required>產品原價</Label>
            <input type="number" className="pd-input" value={spec.originPrice} onChange={set('originPrice')} disabled={locked} />
          </div>
          <div className="pd-col">
            <Label>產品優惠價</Label>
            <input type="number" className="pd-input" value={spec.discountPrice} onChange={set('discountPrice')} disabled={locked} />
          </div>
          <div className="pd-col">
            <Label required>庫存量</Label>
            <input type="number" className="pd-input" value={spec.stock} onChange={set('stock')} />
          </div>
          <div className="pd-col">
            <Label>銷售量</Label>
            <div className="pd-sold">{spec.sold}</div>
          </div>
          <div className="pd-col">
            <Label>成本</Label>
            <input type="number" className="pd-input" value={spec.cost ?? ''} onChange={set('cost')} />
          </div>
          <div className="pd-col">
            <Label>運費</Label>
            <input type="number" className="pd-input" value={spec.freight ?? ''} onChange={set('freight')} />
          </div>
        </div>
      </div>

      {/* Row 2: 日期 */}
      <div className="pd-grid-9">
        <div className="pd-col col-span-2">
          <Label required>預計出貨日</Label>
          <input type="date" className="pd-input" value={spec.expectShipDate || ''} onChange={set('expectShipDate')} />
        </div>
        <div className="pd-col col-span-2">
          <Label>預計最後出貨日</Label>
          <input type="date" className="pd-input" value={spec.expectLastShipDate || ''} onChange={set('expectLastShipDate')} />
        </div>
        <div className="pd-col col-span-2">
          <Label required>開始販售</Label>
          <input type="text" className="pd-input" placeholder="YYYY/MM/DD HH:mm" value={spec.saleStart || ''} onChange={set('saleStart')} />
        </div>
        <div className="pd-col col-span-2">
          <Label required>結束販售</Label>
          <input type="text" className="pd-input" placeholder="YYYY/MM/DD HH:mm" value={spec.saleEnd || ''} onChange={set('saleEnd')} />
        </div>
        <div className="pd-col">
          <Label required>自動延後區間</Label>
          <input type="number" className="pd-input" value={spec.autoExtendDays ?? 0} onChange={set('autoExtendDays')} />
        </div>
      </div>

      {/* Row 3: 規格限制 */}
      <div className="pd-limit-wrap">
        <div className="pd-limit-title">規格限制</div>
        <div className="pd-limit-group">
          <AntCheck checked={spec.isListed} onChange={set('isListed')} label="上架" />
          <AntCheck checked={spec.isYuanxiong} onChange={set('isYuanxiong')} label="是否為遠雄產品" />
          <AntCheck checked={spec.isSpecial}      onChange={set('isSpecial')}      label="是否特殊商品"   disabled={locked} />
          <AntCheck checked={spec.isCOD}          onChange={set('isCOD')}          label="是否貨到付款"   disabled={locked} />
          <AntCheck checked={spec.isSubscription} onChange={set('isSubscription')} label="是否為訂閱制商品" disabled={locked} />
          <div className={`pd-threshold ${locked ? 'locked' : ''}`}>
            <AntCheck checked={!!spec.thresholdAmount} onChange={() => {/* 由金額本身控制 */}} label="滿" disabled={locked} />
            <input type="number" className="pd-input w-24" value={spec.thresholdAmount || ''} onChange={set('thresholdAmount')} disabled={locked} />
            <span className="whitespace">元可購買，限購數量</span>
            <input type="number" className="pd-input w-16" value={spec.limitQuantity || ''} onChange={set('limitQuantity')} disabled={locked} />
          </div>
          {/* 設為贈品 — 與其他 checkbox 同一視覺 */}
          <AntCheck checked={spec.isGift} onChange={toggleGift} label="設為贈品" />
        </div>
      </div>

      {/* Row 4: 補庫存 + 規格變更紀錄 */}
      <div className="pd-row-4">
        <div className="pd-replenish">
          <Label hint="商品庫存歸零時自動補貨的數量">售完補庫存</Label>
          <input type="number" className="pd-input" placeholder="請輸入" value={spec.autoReplenish ?? ''} onChange={set('autoReplenish')} />
        </div>
        <div className="pd-replenish">
          <Label hint="每週自動補庫存的數量">排程補庫存</Label>
          <input type="number" className="pd-input" placeholder="請輸入" value={spec.weeklyReplenish ?? ''} onChange={set('weeklyReplenish')} />
        </div>
        <div className="pd-replenish-btn">
          <button type="button" className="pd-btn pd-btn-default">規格變更紀錄</button>
        </div>
        <div className="grow" />
        <button
          type="button"
          className="pd-btn pd-btn-danger"
          disabled={spec.sold > 0}
          onClick={onRemove}
        >刪除此規格</button>
      </div>

      {locked && (
        <div className="pd-gift-hint">
          ⚠️ 此規格已設為贈品，「特殊商品／貨到付款／訂閱制／滿額限購／原價／優惠價」等互斥設定已自動停用
        </div>
      )}
    </div>
  )
}

function Label({ children, required, hint }) {
  return (
    <label className="pd-label">
      {required && <span className="req">*</span>}
      {children}
      {hint && <span className="info" title={hint}>ⓘ</span>}
    </label>
  )
}

function AntCheck({ checked, onChange, label, disabled }) {
  return (
    <label className={`ant-ck ${disabled ? 'disabled' : ''}`}>
      <input type="checkbox" checked={!!checked} onChange={onChange} disabled={disabled} />
      <span>{label}</span>
    </label>
  )
}
