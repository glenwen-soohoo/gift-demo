import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGiftRules } from '../../context/GiftRulesContext'
import { useProducts } from '../../context/ProductContext'
import { findSpecById } from '../../data/productSpecs'
import Switch from '../../components/Switch'
import { PRODUCTION_LINES, TEMPERATURES } from '../../data/giftRules'

export default function AdminGiftList() {
  // 注意：贈品列表不提供「刪除」入口，避免和「規格刪除」混淆。
  //   贈品的本質是「某規格被勾選為贈品」，要取消請去產品編輯頁取消勾選「設為贈品」，
  //   贈品列表會同步消失（產品端是 single source of truth）
  const { rules, toggleListed, updateStock } = useGiftRules()
  const { products } = useProducts()
  const [editingStockId, setEditingStockId] = useState(null)
  const [stockDraft, setStockDraft] = useState('')

  // ─── 把 rule 跟 ProductDetail join 起來（IsListed / Stock 來自 spec.Display / spec.Stock）──
  // production 對齊：贈品管理頁顯示的「上架」「庫存」就是直接讀產品規格表
  const enrichedRules = useMemo(() => rules.map(r => {
    const found = findSpecById(products, r.Id)
    return {
      ...r,
      IsListed: found?.spec.Display === true,
      Stock: found?.spec.Stock ?? 0,
    }
  }), [rules, products])

  const startStockEdit = (r) => {
    setEditingStockId(r.Id)
    setStockDraft(String(r.Stock ?? 0))
  }
  const commitStock = (id) => {
    const n = Number(stockDraft)
    if (!Number.isNaN(n) && n >= 0) updateStock(id, n)
    setEditingStockId(null)
  }
  const cancelStockEdit = () => setEditingStockId(null)

  // 輸入中的條件（pending）— 內部變數名仍保留 camelCase（UI state 非 DTO）
  const [kw, setKw] = useState('')
  const [pl, setPl] = useState('')     // ProductionLine 整數或 ''
  const [rt, setRt] = useState('')     // RuleType 字串或 ''
  const [ls, setLs] = useState('')     // 'on' / 'off' / ''
  // 已套用的條件（applied）— 只有點「查詢」才會更新
  const [applied, setApplied] = useState({ kw: '', pl: '', rt: '', ls: '' })

  const filtered = useMemo(() => enrichedRules.filter(r => {
    const { kw, pl, rt, ls } = applied
    if (kw && !`${r.Id} ${r.ProductId} ${r.ProductName}`.includes(kw)) return false
    if (pl !== '' && r.ProductionLine !== pl) return false
    if (rt && r.RuleType !== rt) return false
    if (ls === 'on' && !r.IsListed) return false
    if (ls === 'off' && r.IsListed) return false
    return true
  }), [enrichedRules, applied])

  const handleSearch = () => setApplied({ kw, pl, rt, ls })

  return (
    <div className="admin-gift-list">
      {/* 查詢 card */}
      <section className="admin-card">
        <h3 className="admin-card-title">贈品查詢</h3>
        <div className="admin-card-body">
          <div className="form-row">
            <label>品名或ID</label>
            <input
              type="text"
              placeholder="請輸入產品名稱、規格ID或產品ID"
              value={kw}
              onChange={e => setKw(e.target.value)}
              className="form-input"
              style={{ width: 280 }}
            />
          </div>
          <div className="form-row">
            <label>贈品產線</label>
            <div className="radio-group">
              <Radio checked={pl === ''} onChange={() => setPl('')} label="All" />
              {PRODUCTION_LINES.map(p => (
                <Radio key={p.Value} checked={pl === p.Value} onChange={() => setPl(p.Value)} label={p.Label} />
              ))}
            </div>
          </div>
          <div className="form-row">
            <label>贈送條件</label>
            <div className="radio-group">
              <Radio checked={rt === ''} onChange={() => setRt('')} label="All" />
              <Radio checked={rt === 'Threshold'} onChange={() => setRt('Threshold')} label="滿額贈" />
              <Radio checked={rt === 'BuyToGet'} onChange={() => setRt('BuyToGet')} label="買就送" />
            </div>
          </div>
          <div className="form-row">
            <label>上架</label>
            <div className="radio-group">
              <Radio checked={ls === ''} onChange={() => setLs('')} label="All" />
              <Radio checked={ls === 'on'} onChange={() => setLs('on')} label="上架" />
              <Radio checked={ls === 'off'} onChange={() => setLs('off')} label="下架" />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: 4 }}>
            <label></label>
            <button type="button" className="btn-primary" onClick={handleSearch}>查詢</button>
          </div>
        </div>
      </section>

      {/* 列表 */}
      <section className="admin-card admin-card-table">
        <table className="gift-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>封面照</th>
              <th>產品名稱</th>
              <th>產品規格</th>
              <th>上架</th>
              <th>贈送條件</th>
              <th>重複贈送</th>
              <th>剩餘數量</th>
              <th>產線/溫層</th>
              <th>限購規則</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const pl = PRODUCTION_LINES.find(x => x.Value === r.ProductionLine)
              const temp = TEMPERATURES.find(x => x.Value === r.TemperatureLayer)
              return (
                <tr key={r.Id}>
                  <td className="cell-id">
                    <div>{r.ProductId}</div>
                    <div className="cell-id-sub">{r.Id}</div>
                  </td>
                  <td>
                    <img src={r.Pic} alt="" className="gift-thumb" />
                  </td>
                  <td className="cell-name">{r.ProductName}</td>
                  <td>{r.ProductSpec}</td>
                  <td className="cell-center">
                    <Switch
                      size="sm"
                      checked={!!r.IsListed}
                      onChange={() => toggleListed(r.Id)}
                    />
                  </td>
                  <td className="cell-cond">{renderCondition(r)}</td>
                  <td className="cell-center">
                    {r.Repeatable
                      ? <span style={{ color: '#22c55e', fontWeight: 600 }}>是</span>
                      : <span style={{ color: '#999' }}>否</span>}
                  </td>
                  <td className={`cell-center ${r.Stock === 0 && editingStockId !== r.Id ? 'stock-zero' : ''}`}>
                    {editingStockId === r.Id ? (
                      <div className="stock-edit-stack">
                        <input
                          type="number"
                          className="form-input stock-input"
                          value={stockDraft}
                          autoFocus
                          onChange={e => setStockDraft(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') commitStock(r.Id)
                            else if (e.key === 'Escape') cancelStockEdit()
                          }}
                        />
                        <div className="stock-actions-row">
                          <button
                            type="button"
                            className="icon-btn-confirm"
                            onClick={() => commitStock(r.Id)}
                            title="儲存"
                          >
                            <i className="fa fa-check" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="icon-btn-cancel"
                            onClick={cancelStockEdit}
                            title="取消"
                          >
                            <i className="fa fa-times" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="stock-display-stack">
                        <span>{r.Stock === 0 ? <>❌&nbsp;0</> : r.Stock}</span>
                        <button
                          type="button"
                          className="icon-btn-pencil"
                          onClick={() => startStockEdit(r)}
                          title="修改庫存"
                        >
                          <i className="fa fa-pencil" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="cell-pl-temp">
                    <div>{pl?.Label}</div>
                    <div className="cell-sub">{temp?.Label}</div>
                  </td>
                  <td>
                    {(r.MembershipLimits ?? []).length === 0
                      ? '無'
                      : r.MembershipLimits.map(m => (
                          <div key={m}>{m === 'FirstOrder' ? '首購' : m}</div>
                        ))}
                  </td>
                  <td className="cell-ops">
                    <Link to={`/admin/gifts/${r.Id}`} className="btn-op">編輯</Link>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={11} style={{ textAlign: 'center', padding: 24, color: '#999' }}>沒有符合的資料</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function renderCondition(r) {
  if (!r.RuleType) {
    return <span className="cond-unset">未設定</span>
  }
  if (r.RuleType === 'Threshold') {
    const pl = PRODUCTION_LINES.find(x => x.Value === r.ProductionLine)
    return (
      <>
        <div><strong>滿額贈</strong></div>
        <div>{pl?.Label} &gt; {r.ThresholdAmount}元</div>
        <div>送 {r.GiftQuantity} 個</div>
      </>
    )
  }
  return (
    <>
      <div><strong>買就送</strong></div>
      <div>指定商品 &gt; {r.ThresholdQuantity} 個</div>
      <div>送 {r.GiftQuantity} 個</div>
    </>
  )
}

function Radio({ checked, onChange, label }) {
  return (
    <label className="radio">
      <input type="radio" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  )
}
