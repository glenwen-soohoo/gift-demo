import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGiftRules } from '../../context/GiftRulesContext'
import { PRODUCTION_LINES, TEMPERATURES } from '../../data/giftRules'

export default function AdminGiftList() {
  const { rules, toggleListed, deleteRule } = useGiftRules()

  // 輸入中的條件（pending）
  const [kw, setKw] = useState('')
  const [pl, setPl] = useState('')
  const [rt, setRt] = useState('')
  const [ls, setLs] = useState('')
  // 已套用的條件（applied）— 只有點「查詢」才會更新
  const [applied, setApplied] = useState({ kw: '', pl: '', rt: '', ls: '' })

  const [confirmId, setConfirmId] = useState(null)

  const filtered = useMemo(() => rules.filter(r => {
    const { kw, pl, rt, ls } = applied
    if (kw && !`${r.id} ${r.productId} ${r.productName}`.includes(kw)) return false
    if (pl && r.productionline !== pl) return false
    if (rt && r.ruleType !== rt) return false
    if (ls === 'on' && !r.isListed) return false
    if (ls === 'off' && r.isListed) return false
    return true
  }), [rules, applied])

  const handleSearch = () => setApplied({ kw, pl, rt, ls })

  const handleDeleteClick = (id) => {
    if (confirmId === id) {
      deleteRule(id)
      setConfirmId(null)
    } else {
      setConfirmId(id)
      // 5 秒後自動取消確認狀態
      setTimeout(() => setConfirmId(cur => cur === id ? null : cur), 5000)
    }
  }

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
                <Radio key={p.value} checked={pl === p.value} onChange={() => setPl(p.value)} label={p.label} />
              ))}
            </div>
          </div>
          <div className="form-row">
            <label>贈送條件</label>
            <div className="radio-group">
              <Radio checked={rt === ''} onChange={() => setRt('')} label="All" />
              <Radio checked={rt === 'threshold'} onChange={() => setRt('threshold')} label="滿額贈" />
              <Radio checked={rt === 'buy_to_get'} onChange={() => setRt('buy_to_get')} label="買就送" />
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
              <th>規格ID</th>
              <th>產品ID</th>
              <th>封面照</th>
              <th>產品名稱</th>
              <th>產品規格</th>
              <th>贈送條件</th>
              <th>上架</th>
              <th>剩餘數量</th>
              <th>產線</th>
              <th>溫層</th>
              <th>限購規則</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const pl = PRODUCTION_LINES.find(x => x.value === r.productionline)
              const temp = TEMPERATURES.find(x => x.value === r.temperature)
              const isConfirming = confirmId === r.id
              return (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.productId}</td>
                  <td>
                    <img src={r.image} alt="" className="gift-thumb" />
                  </td>
                  <td className="cell-name">{r.productName}</td>
                  <td>{r.productSpec}</td>
                  <td className="cell-cond">{renderCondition(r)}</td>
                  <td className="cell-center">
                    {r.isListed
                      ? <span className="ck-on" onClick={() => toggleListed(r.id)}>✅</span>
                      : <span className="ck-off" onClick={() => toggleListed(r.id)}>❌</span>}
                  </td>
                  <td className={`cell-center ${r.stock === 0 ? 'stock-zero' : ''}`}>
                    {r.stock === 0 ? <>❌&nbsp;0</> : r.stock}
                  </td>
                  <td>{pl?.label}</td>
                  <td>{temp?.label}</td>
                  <td>
                    {(r.membershipLimit ?? []).length === 0
                      ? '無'
                      : r.membershipLimit.map(m => <div key={m}>{m}</div>)}
                  </td>
                  <td className="cell-ops">
                    <Link to={`/admin/gifts/${r.id}`} className="btn-op">編輯</Link>
                    <button
                      type="button"
                      className={`btn-op ${isConfirming ? 'btn-danger-confirm' : ''}`}
                      onClick={() => handleDeleteClick(r.id)}
                    >
                      {isConfirming ? '確定刪除' : '刪除'}
                    </button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={12} style={{ textAlign: 'center', padding: 24, color: '#999' }}>沒有符合的資料</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function renderCondition(r) {
  if (!r.ruleType) {
    return <span className="cond-unset">未設定</span>
  }
  if (r.ruleType === 'threshold') {
    return (
      <>
        <div><strong>滿額贈</strong></div>
        <div>{PRODUCTION_LINES.find(x => x.value === r.productionline)?.label} &gt; {r.thresholdAmount}元</div>
        <div>送 {r.giftQuantity} 個</div>
      </>
    )
  }
  return (
    <>
      <div><strong>買就送</strong></div>
      <div>指定商品 &gt; {r.thresholdQuantity} 個</div>
      <div>送 {r.giftQuantity} 個</div>
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
