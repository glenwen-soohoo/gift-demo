import { useParams } from 'react-router-dom'
import { useProducts } from '../../context/ProductContext'
import { useGiftRules } from '../../context/GiftRulesContext'
import { ProductCategoryEnum, TemperatureLayer } from '../../data/fakeData'
import { GIFT_RULE_STATE } from '../../data/giftRules'

// 後台「產品編輯 - 規格設定」頁
// 參照 https://greenbox.tw/GoX/Product/Edit18/:id 下載的 HTML 實際 DOM 重建
// 真實系統用 Ant Design 5 + Tailwind，這裡用純 CSS 模擬視覺
//
// 【Phase D】欄位名對齊 ProductDetail（designer.cs）：
//   Sort / Detail / Quantity / Unit / OriginAmt / DiscPrice / Stock / SoldAmt / Cost / Freight
//   OrdersTime / OrdersFinalExportTime / StartTime / EndTime / AutoReplenishOnZero
//   Display / IsYuanxiong / IsSpecial / IsCOD / IsSubscritpion / ThresholdAmount / Limit / IsGift

export default function AdminProductEdit() {
  const { id } = useParams()
  const productId = Number(id ?? 69928)
  const { products, updateSpec, addSpec, removeSpec } = useProducts()
  const { rules, addRule, deleteRule } = useGiftRules()
  const product = products[productId]

  if (!product) {
    return <div style={{ padding: 24 }}>找不到產品 #{productId}。</div>
  }

  // ─── 設為贈品 lifecycle（對齊 production fruit_web 設計）──
  // 勾選 IsGift=true  → 自動建立 draft GiftRule（RuleType=null, State=草稿）
  // 取消勾選 IsGift=false → 直接刪除對應 GiftRule（不論狀態），贈品列表會同步消失
  //   設計意圖：「贈品」是從產品規格勾選來的，產品端是 single source of truth；
  //   不該由贈品列表反向阻擋產品端取消勾選。
  const handleSpecChange = (spec, patch) => {
    // 偵測 IsGift 狀態變化
    if ('IsGift' in patch && patch.IsGift !== spec.IsGift) {
      const turningOn = patch.IsGift === true
      const existingRule = rules.find(r => r.Id === spec.Id)

      if (turningOn) {
        // 勾選贈品：建立 draft GiftRule（若還沒有）
        if (!existingRule) {
          addRule({
            Id: spec.Id,                 // demo: rule.Id === ProductDetailId
            ProductId: productId,
            ProductName: product.Name,
            ProductSpec: spec.Detail || '贈品',
            SpecSuffix: '',
            Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202502200530421.jpg',
            DeliveryTime: '',
            RuleType: null,              // 未設定贈送條件
            ProductionLine: product.ProductionLine,
            TemperatureLayer: product.TemperatureLayer,
            ThresholdAmount: 0,
            HintAmount: 0,
            ThresholdQuantity: 0,
            UseProductIds: false,
            UseSpecIds: false,
            TargetProductIds: [],
            TargetSpecIds: [],
            GiftQuantity: 1,
            Repeatable: false,
            PopupText: '',
            MembershipLimits: [],
            State: GIFT_RULE_STATE.草稿,
            StartTime: null,
            EndTime: null,
          })
        }
      } else {
        // 取消贈品：直接刪除對應規則（不論草稿/上架/下架狀態）
        if (existingRule) {
          deleteRule(existingRule.Id)
        }
      }
    }
    updateSpec(productId, spec.Id, patch)
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
          {product.Specs.map((spec, idx) => (
            <SpecRow
              key={spec.Id}
              spec={spec}
              index={idx}
              onChange={(patch) => handleSpecChange(spec, patch)}
              onRemove={() => removeSpec(productId, spec.Id)}
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
  const locked = spec.IsGift

  const set = (key) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked :
              e.target.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) :
              e.target.value
    onChange({ [key]: v })
  }

  const toggleGift = (e) => {
    const next = e.target.checked
    const patch = { IsGift: next }
    if (next) {
      // 設為贈品 → 清空 / 關閉互斥欄位
      patch.IsSpecial = false
      patch.IsCOD = false
      patch.IsSubscritpion = false
      patch.ThresholdAmount = 0
      patch.Limit = 0
      patch.OriginAmt = 0
      patch.DiscPrice = 0
      if (!spec.Detail) patch.Detail = '贈品'
    }
    onChange(patch)
  }

  return (
    <div className={`pd-spec-card ${locked ? 'is-gift' : ''}`}>
      {/* Row 1: 規格排序 + 規格 ID + 主要欄位 */}
      <div className="pd-row-1">
        <div className="pd-col pd-col-sort">
          <Label required>規格排序</Label>
          <input type="number" className="pd-input" value={spec.Sort} onChange={set('Sort')} />
          <div className="pd-spec-id">規格 ID: {spec.Id}</div>
        </div>

        <div className="pd-grid-10 grow">
          <div className="pd-col col-span-2">
            <Label>規格描述</Label>
            <input type="text" className="pd-input" value={spec.Detail} onChange={set('Detail')} />
          </div>
          <div className="pd-col">
            <Label required>規格量</Label>
            <input type="number" className="pd-input" value={spec.Quantity} onChange={set('Quantity')} />
          </div>
          <div className="pd-col">
            <Label required>單位</Label>
            <select className="pd-select" value={spec.Unit} onChange={set('Unit')}>
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
            <input type="number" className="pd-input" value={spec.OriginAmt} onChange={set('OriginAmt')} disabled={locked} />
          </div>
          <div className="pd-col">
            <Label>產品優惠價</Label>
            <input type="number" className="pd-input" value={spec.DiscPrice} onChange={set('DiscPrice')} disabled={locked} />
          </div>
          <div className="pd-col">
            <Label required>庫存量</Label>
            <input type="number" className="pd-input" value={spec.Stock} onChange={set('Stock')} />
          </div>
          <div className="pd-col">
            <Label>銷售量</Label>
            <div className="pd-sold">{spec.SoldAmt}</div>
          </div>
          <div className="pd-col">
            <Label>成本</Label>
            <input type="number" className="pd-input" value={spec.Cost ?? ''} onChange={set('Cost')} />
          </div>
          <div className="pd-col">
            <Label>運費</Label>
            <input type="number" className="pd-input" value={spec.Freight ?? ''} onChange={set('Freight')} />
          </div>
        </div>
      </div>

      {/* Row 2: 日期 */}
      <div className="pd-grid-9">
        <div className="pd-col col-span-2">
          <Label required>預計出貨日</Label>
          <input type="date" className="pd-input" value={spec.OrdersTime || ''} onChange={set('OrdersTime')} />
        </div>
        <div className="pd-col col-span-2">
          <Label>預計最後出貨日</Label>
          <input type="date" className="pd-input" value={spec.OrdersFinalExportTime || ''} onChange={set('OrdersFinalExportTime')} />
        </div>
        <div className="pd-col col-span-2">
          <Label required>開始販售</Label>
          <input type="text" className="pd-input" placeholder="YYYY/MM/DD HH:mm" value={spec.StartTime || ''} onChange={set('StartTime')} />
        </div>
        <div className="pd-col col-span-2">
          <Label required>結束販售</Label>
          <input type="text" className="pd-input" placeholder="YYYY/MM/DD HH:mm" value={spec.EndTime || ''} onChange={set('EndTime')} />
        </div>
        <div className="pd-col">
          <Label required>自動延後區間</Label>
          <input type="number" className="pd-input" value={spec.AutoReplenishOnZero ?? 0} onChange={set('AutoReplenishOnZero')} />
        </div>
      </div>

      {/* Row 3: 規格限制 */}
      <div className="pd-limit-wrap">
        <div className="pd-limit-title">規格限制</div>
        <div className="pd-limit-group">
          <AntCheck checked={spec.Display} onChange={set('Display')} label="上架" />
          <AntCheck checked={spec.IsYuanxiong} onChange={set('IsYuanxiong')} label="是否為遠雄產品" />
          <AntCheck checked={spec.IsSpecial}      onChange={set('IsSpecial')}      label="是否特殊商品"   disabled={locked} />
          <AntCheck checked={spec.IsCOD}          onChange={set('IsCOD')}          label="是否貨到付款"   disabled={locked} />
          <AntCheck checked={spec.IsSubscritpion} onChange={set('IsSubscritpion')} label="是否為訂閱制商品" disabled={locked} />
          <div className={`pd-threshold ${locked ? 'locked' : ''}`}>
            <AntCheck checked={!!spec.ThresholdAmount} onChange={() => {/* 由金額本身控制 */}} label="滿" disabled={locked} />
            <input type="number" className="pd-input w-24" value={spec.ThresholdAmount || ''} onChange={set('ThresholdAmount')} disabled={locked} />
            <span className="whitespace">元可購買，限購數量</span>
            <input type="number" className="pd-input w-16" value={spec.Limit || ''} onChange={set('Limit')} disabled={locked} />
          </div>
          {/* 設為贈品 — 與其他 checkbox 同一視覺 */}
          <AntCheck checked={spec.IsGift} onChange={toggleGift} label="設為贈品" />
        </div>
      </div>

      {/* Row 4: 補庫存 + 規格變更紀錄 */}
      <div className="pd-row-4">
        <div className="pd-replenish">
          <Label hint="商品庫存歸零時自動補貨的數量">售完補庫存</Label>
          <input type="number" className="pd-input" placeholder="請輸入" value={spec.AutoReplenish ?? ''} onChange={set('AutoReplenish')} />
        </div>
        <div className="pd-replenish">
          <Label hint="每週自動補庫存的數量">排程補庫存</Label>
          <input type="number" className="pd-input" placeholder="請輸入" value={spec.WeeklyReplenish ?? ''} onChange={set('WeeklyReplenish')} />
        </div>
        <div className="pd-replenish-btn">
          <button type="button" className="pd-btn pd-btn-default">規格變更紀錄</button>
        </div>
        <div className="grow" />
        <button
          type="button"
          className="pd-btn pd-btn-danger"
          disabled={spec.SoldAmt > 0}
          onClick={onRemove}
        >刪除此規格</button>
      </div>
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
