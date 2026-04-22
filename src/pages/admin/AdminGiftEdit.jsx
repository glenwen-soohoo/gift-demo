import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGiftRules } from '../../context/GiftRulesContext'
import {
  PRODUCTION_LINES, TEMPERATURES, RULE_TYPE,
  TARGET_PRODUCT_NAMES, TARGET_SPEC_NAMES,
} from '../../data/giftRules'

const EMPTY_RULE = {
  productId: '',
  productName: '',
  productSpec: '1個(贈品)',
  image: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202502200530421.jpg',
  ruleType: 'threshold',
  productionline: 'babyfood',
  temperature: 'frozen',
  thresholdAmount: '',
  hintAmount: '',
  thresholdQuantity: '',
  useProductIds: true,
  useSpecIds: false,
  targetProductIds: [],
  targetSpecIds: [],
  giftQuantity: 1,
  popupText: '',
  stock: 0,
  isListed: true,
  membershipLimit: [],
}

export default function AdminGiftEdit() {
  const { id } = useParams()
  const nav = useNavigate()
  const { rules, addRule, updateRule } = useGiftRules()
  const isNew = !id || id === 'new'

  const [form, setForm] = useState(EMPTY_RULE)
  const [productIdsText, setProductIdsText] = useState('')
  const [specIdsText,    setSpecIdsText]    = useState('')
  const [preview, setPreview] = useState(null)  // 'product' | 'spec' | null

  useEffect(() => {
    if (isNew) return
    const found = rules.find(r => String(r.id) === id)
    if (found) {
      // 若 ruleType 尚未設定（從產品規格勾選贈品建立出來的），預設走「滿額贈」tab
      setForm({ ...EMPTY_RULE, ...found, ruleType: found.ruleType || 'threshold' })
      setProductIdsText((found.targetProductIds ?? []).join(', '))
      setSpecIdsText((found.targetSpecIds ?? []).join(', '))
    }
  }, [id, rules, isNew])

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const parseIds = (text) => text
    .split(/[,\s，、]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter(n => !Number.isNaN(n))

  const handleSave = () => {
    const payload = {
      ...form,
      targetProductIds: form.useProductIds ? parseIds(productIdsText) : [],
      targetSpecIds:    form.useSpecIds    ? parseIds(specIdsText)    : [],
    }
    if (isNew) {
      addRule(payload)
    } else {
      updateRule(Number(id), payload)
    }
    nav('/admin/gifts')
  }

  const pl = PRODUCTION_LINES.find(p => p.value === form.productionline)
  const temp = TEMPERATURES.find(t => t.value === form.temperature)

  return (
    <div className="admin-gift-edit">
      <section className="admin-card">
        <h3 className="admin-card-title green-header">贈送條件設定</h3>

        <div className="admin-card-body">
          {/* 贈品資訊（唯讀）*/}
          <section className="gift-info-box">
            <h4>贈品資訊</h4>
            <div className="gift-info-row">
              <img src={form.image} alt="" className="gift-info-thumb" />
              <div className="gift-info-cols gift-info-cols-2">
                <div className="gift-info-col">
                  <InfoPair label="產品ID"  value={form.productId || '(尚未綁定)'} />
                  <InfoPair label="名稱"    value={form.productName || '(新贈品)'} />
                  <InfoPair label="規格ID"  value={isNew ? '(建立後產生)' : (id ?? '')} />
                  <InfoPair label="規格"    value={form.productSpec} />
                </div>
                <div className="gift-info-col">
                  <InfoPair label="剩餘數量"   value={form.stock} />
                  <InfoPair label="上架狀態"   value={form.isListed ? '✅' : '❌'} />
                  <InfoPair label="產線"       value={pl?.label} />
                  <InfoPair label="溫層"       value={temp?.label} />
                  <InfoPair label="限購規則"
                    value={(form.membershipLimit ?? []).length === 0 ? '無' : form.membershipLimit.join('、')}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 贈送條件 */}
          <section className="cond-box">
            <h4>贈送條件</h4>

            <div className="form-row">
              <label>上架狀態：</label>
              <div className="radio-group">
                <label className="radio">
                  <input
                    type="radio"
                    checked={form.isListed === true}
                    onChange={() => update('isListed', true)}
                  />
                  <span>上架</span>
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    checked={form.isListed === false}
                    onChange={() => update('isListed', false)}
                  />
                  <span>下架</span>
                </label>
              </div>
            </div>

            <div className="form-row">
              <label>贈送條件：</label>
              <div className="tab-group">
                {Object.values(RULE_TYPE).map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`tab-btn ${form.ruleType === t.value ? 'active' : ''}`}
                    onClick={() => update('ruleType', t.value)}
                  >{t.label}</button>
                ))}
              </div>
              <span className="hint">
                {form.ruleType === 'threshold'
                  ? '與贈品同產線、同溫層購買達到指定金額門檻，即可獲得贈品。'
                  : '購買指定的商品達到指定數量，即可獲得贈品。'}
              </span>
            </div>

            {form.ruleType === 'threshold' ? (
              <>
                <div className="form-row">
                  <label>贈送金額門檻：</label>
                  <input
                    type="number" className="form-input"
                    placeholder="請輸入贈送門檻的金額"
                    value={form.thresholdAmount}
                    onChange={e => update('thresholdAmount', Number(e.target.value))}
                  />
                </div>
                <div className="form-row">
                  <label>顯示提示金額：</label>
                  <input
                    type="number" className="form-input"
                    placeholder="請輸入達多少金額顯示提示"
                    value={form.hintAmount}
                    onChange={e => update('hintAmount', Number(e.target.value))}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-row form-row-align-top">
                  <label>指定產品：</label>
                  <div className="target-box">
                    <div className="target-line">
                      <label className="checkbox target-check">
                        <input
                          type="checkbox"
                          checked={form.useProductIds}
                          onChange={e => update('useProductIds', e.target.checked)}
                        />
                        <span>用產品 ID</span>
                      </label>
                      <input
                        type="text"
                        className="form-input target-input"
                        placeholder="75766, 75765"
                        value={productIdsText}
                        onChange={e => setProductIdsText(e.target.value)}
                        disabled={!form.useProductIds}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setPreview('product')}
                        disabled={!form.useProductIds}
                      >查看指定產品名稱</button>
                    </div>
                    <div className="target-line">
                      <label className="checkbox target-check">
                        <input
                          type="checkbox"
                          checked={form.useSpecIds}
                          onChange={e => update('useSpecIds', e.target.checked)}
                        />
                        <span>用規格 ID</span>
                      </label>
                      <input
                        type="text"
                        className="form-input target-input"
                        placeholder="123459, 123464, 123465"
                        value={specIdsText}
                        onChange={e => setSpecIdsText(e.target.value)}
                        disabled={!form.useSpecIds}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setPreview('spec')}
                        disabled={!form.useSpecIds}
                      >查看指定規格名稱</button>
                    </div>
                    <ul className="target-hints">
                      <li>若想一次指定多項產品，可用逗號分隔，例如：75766, 75765, 75764。</li>
                      <li>產品 ID 會直接抓該產品的所有規格，無須在規格 ID 重複輸入</li>
                    </ul>
                  </div>
                </div>

                <div className="form-row">
                  <label>購買件數：</label>
                  <input
                    type="number" className="form-input"
                    placeholder="達幾件可獲贈"
                    value={form.thresholdQuantity}
                    onChange={e => update('thresholdQuantity', Number(e.target.value))}
                  />
                </div>
              </>
            )}

            <div className="form-row">
              <label>贈送數量：</label>
              <input
                type="number" className="form-input"
                placeholder="請輸入贈送的數量"
                value={form.giftQuantity}
                onChange={e => update('giftQuantity', Number(e.target.value))}
              />
            </div>

            <div className="form-row">
              <label>彈窗補充說明：</label>
              <textarea
                className="form-input"
                placeholder="請輸入會顯示在前台頁面的說明文字"
                rows={3}
                value={form.popupText}
                onChange={e => update('popupText', e.target.value)}
                style={{ width: 360 }}
              />
            </div>

            {isNew && (
              <>
                <div className="form-row">
                  <label>贈品名稱：</label>
                  <input
                    type="text" className="form-input"
                    value={form.productName}
                    onChange={e => update('productName', e.target.value)}
                    placeholder="請輸入贈品名稱"
                    style={{ width: 320 }}
                  />
                </div>
                <div className="form-row">
                  <label>產品 ID：</label>
                  <input
                    type="number" className="form-input"
                    value={form.productId}
                    onChange={e => update('productId', Number(e.target.value))}
                    placeholder="贈品所屬的產品 ID"
                  />
                </div>
                <div className="form-row">
                  <label>庫存：</label>
                  <input
                    type="number" className="form-input"
                    value={form.stock}
                    onChange={e => update('stock', Number(e.target.value))}
                  />
                </div>
                <div className="form-row">
                  <label>產線：</label>
                  <select
                    className="form-input"
                    value={form.productionline}
                    onChange={e => update('productionline', e.target.value)}
                  >
                    {PRODUCTION_LINES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label>溫層：</label>
                  <select
                    className="form-input"
                    value={form.temperature}
                    onChange={e => update('temperature', e.target.value)}
                  >
                    {TEMPERATURES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </>
            )}

            <div className="form-actions-bar">
              <div className="time-info">
                <span>建立時間：{form.createTime || '—'} {form.createUser || ''}</span>
                <span>更新時間：{form.updateTime || '—'}</span>
              </div>
              <div className="action-buttons">
                <button type="button" className="btn-secondary" onClick={() => nav('/admin/gifts')}>取消</button>
                <button type="button" className="btn-primary" onClick={handleSave}>儲存</button>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* 查看指定名稱 modal */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h4>{preview === 'product' ? '指定產品名稱' : '指定規格名稱'}</h4>
            {preview === 'product' ? (
              <table className="modal-table">
                <thead>
                  <tr><th>產品 ID</th><th>名稱</th></tr>
                </thead>
                <tbody>
                  {parseIds(productIdsText).length === 0
                    ? <tr><td colSpan={2} style={{ textAlign: 'center', color: '#999' }}>尚未輸入任何 ID</td></tr>
                    : parseIds(productIdsText).map(pid => (
                      <tr key={pid}>
                        <td>{pid}</td>
                        <td>{TARGET_PRODUCT_NAMES[pid] ?? <span style={{ color: '#dc4e43' }}>找不到此產品</span>}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <table className="modal-table">
                <thead>
                  <tr><th>規格 ID</th><th>產品名稱</th><th>規格</th></tr>
                </thead>
                <tbody>
                  {parseIds(specIdsText).length === 0
                    ? <tr><td colSpan={3} style={{ textAlign: 'center', color: '#999' }}>尚未輸入任何 ID</td></tr>
                    : parseIds(specIdsText).map(sid => {
                      const info = TARGET_SPEC_NAMES[sid]
                      return (
                        <tr key={sid}>
                          <td>{sid}</td>
                          <td>{info?.productName ?? <span style={{ color: '#dc4e43' }}>找不到此規格</span>}</td>
                          <td>{info?.spec ?? '—'}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            )}
            <div className="modal-actions">
              <button type="button" className="btn-primary" onClick={() => setPreview(null)}>關閉</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoPair({ label, value }) {
  return (
    <div className="info-pair">
      <span className="info-label">{label}：</span>
      <span className="info-value">{value}</span>
    </div>
  )
}
