import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGiftRules } from '../../context/GiftRulesContext'
import { useProducts } from '../../context/ProductContext'
import { findSpecById } from '../../data/productSpecs'
import Switch from '../../components/Switch'
import {
  PRODUCTION_LINES, TEMPERATURES, RULE_TYPE, GIFT_RULE_STATE,
  TARGET_PRODUCT_NAMES, TARGET_SPEC_NAMES,
} from '../../data/giftRules'
import { ProductCategoryEnum, TemperatureLayer } from '../../data/fakeData'

// form state 對齊 GiftRuleEditViewModel（fruit_web 未來接收的 ViewModel）
// IsListed / Stock 不在 form state（讀寫都走 ProductContext，spec 是單一來源）
const EMPTY_RULE = {
  ProductId: '',
  ProductName: '',
  ProductSpec: '1 個',
  SpecSuffix: '(贈品)',
  Pic: 'https://greenboxcdn.azureedge.net/upload/Product_3033/202502200530421.jpg',
  DeliveryTime: '',
  RuleType: 'Threshold',
  ProductionLine: ProductCategoryEnum.粥寶寶專區,
  TemperatureLayer: TemperatureLayer.冷凍,
  ThresholdAmount: '',
  HintAmount: '',
  ThresholdQuantity: '',
  UseProductIds: true,
  UseSpecIds: false,
  TargetProductIds: [],
  TargetSpecIds: [],
  GiftQuantity: 1,
  Repeatable: false,
  PopupText: '',
  MembershipLimits: [],
  State: GIFT_RULE_STATE.上架中,
}

export default function AdminGiftEdit() {
  const { id } = useParams()
  const nav = useNavigate()
  const { rules, addRule, updateRule, toggleListed, updateStock } = useGiftRules()
  const { products, updateSpec } = useProducts()
  const isNew = !id || id === 'new'

  const [form, setForm] = useState(EMPTY_RULE)
  const [productIdsText, setProductIdsText] = useState('')
  const [specIdsText,    setSpecIdsText]    = useState('')
  const [preview, setPreview] = useState(null)  // 'product' | 'spec' | null
  const [editingStock, setEditingStock] = useState(false)
  const [stockDraft, setStockDraft] = useState('')

  // ─── 從 ProductContext 取贈品本體的 spec（IsListed = spec.Display, Stock = spec.Stock）──
  const ruleId = isNew ? null : Number(id)
  const meta = useMemo(() => {
    if (ruleId == null) return { IsListed: true, Stock: 0, Spec: null, Product: null }
    const found = findSpecById(products, ruleId)
    if (!found) return { IsListed: false, Stock: 0, Spec: null, Product: null }
    return {
      IsListed: found.spec.Display === true,
      Stock: found.spec.Stock ?? 0,
      Spec: found.spec,
      Product: found.product,
    }
  }, [ruleId, products])

  const startStockEdit = () => {
    setStockDraft(String(meta.Stock))
    setEditingStock(true)
  }
  const commitStock = () => {
    const n = Number(stockDraft)
    if (Number.isNaN(n) || n < 0) { setEditingStock(false); return }
    if (!isNew) {
      updateStock(ruleId, n)   // 走 ProductContext.updateSpec → 寫進 ProductDetail.Stock
    } else if (meta.Spec && meta.Product) {
      updateSpec(meta.Product.Id, meta.Spec.Id, { Stock: n })
    }
    setEditingStock(false)
  }
  const cancelStockEdit = () => setEditingStock(false)

  useEffect(() => {
    if (isNew) return
    const found = rules.find(r => String(r.Id) === id)
    if (found) {
      // 若 RuleType 尚未設定（從產品規格勾選贈品建立出來的 draft），預設走「滿額贈」tab
      setForm({ ...EMPTY_RULE, ...found, RuleType: found.RuleType || 'Threshold' })
      setProductIdsText((found.TargetProductIds ?? []).join(', '))
      setSpecIdsText((found.TargetSpecIds ?? []).join(', '))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew])

  // 上下架 Switch：寫進 ProductDetail.Display（即時生效，跟產品管理頁共用同一個欄位）
  const handleToggleListed = (next) => {
    if (!isNew) {
      toggleListed(ruleId)      // 內部會 updateSpec(Display) + 更新 rule.State
    } else if (meta.Spec && meta.Product) {
      updateSpec(meta.Product.Id, meta.Spec.Id, { Display: next })
      update('State', next ? GIFT_RULE_STATE.上架中 : GIFT_RULE_STATE.下架)
    }
  }

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
      TargetProductIds: form.UseProductIds ? parseIds(productIdsText) : [],
      TargetSpecIds:    form.UseSpecIds    ? parseIds(specIdsText)    : [],
    }
    if (isNew) {
      addRule(payload)
    } else {
      updateRule(Number(id), payload)
    }
    nav('/admin/gifts')
  }

  const pl = PRODUCTION_LINES.find(p => p.Value === form.ProductionLine)
  const temp = TEMPERATURES.find(t => t.Value === form.TemperatureLayer)

  return (
    <div className="admin-gift-edit">
      <section className="admin-card">
        <h3 className="admin-card-title green-header">贈送條件設定</h3>

        <div className="admin-card-body">
          {/* 贈品資訊（唯讀）*/}
          <section className="gift-info-box">
            <h4>贈品資訊</h4>
            <div className="gift-info-row">
              <img src={form.Pic} alt="" className="gift-info-thumb" />
              <div className="gift-info-cols gift-info-cols-2">
                <div className="gift-info-col">
                  <InfoPair label="產品ID"  value={form.ProductId || '(尚未綁定)'} />
                  <InfoPair label="名稱"    value={form.ProductName || '(新贈品)'} />
                  <InfoPair label="規格ID"  value={isNew ? '(建立後產生)' : (id ?? '')} />
                  <InfoPair label="規格"    value={form.ProductSpec} />
                </div>
                <div className="gift-info-col">
                  <div className="info-pair">
                    <span className="info-label">剩餘數量：</span>
                    <span className="info-value">
                      {editingStock ? (
                        <span className="stock-edit-wrap">
                          <input
                            type="number"
                            className="form-input stock-input"
                            value={stockDraft}
                            autoFocus
                            onChange={e => setStockDraft(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') commitStock()
                              else if (e.key === 'Escape') cancelStockEdit()
                            }}
                          />
                          <button
                            type="button"
                            className="icon-btn-confirm"
                            onClick={commitStock}
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
                        </span>
                      ) : (
                        <span className="stock-cell">
                          <span>{meta.Stock}</span>
                          <button
                            type="button"
                            className="icon-btn-pencil"
                            onClick={startStockEdit}
                            title="修改庫存（共用 ProductDetail.Stock，產品管理頁也會反映）"
                          >
                            <i className="fa fa-pencil" aria-hidden="true" />
                          </button>
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="info-pair">
                    <span className="info-label">上架狀態：</span>
                    <span className="info-value">
                      <Switch
                        checked={meta.IsListed}
                        onChange={handleToggleListed}
                      />
                      <span className="switch-label-inline">
                        {meta.IsListed ? '上架中' : '已下架'}
                      </span>
                    </span>
                  </div>
                  <InfoPair label="產線"       value={pl?.Label} />
                  <InfoPair label="溫層"       value={temp?.Label} />
                  <InfoPair label="限購規則"
                    value={(form.MembershipLimits ?? []).length === 0
                      ? '無'
                      : form.MembershipLimits.map(m => m === 'FirstOrder' ? '首購' : m).join('、')}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 贈送條件 */}
          <section className="cond-box">
            <h4>贈送條件</h4>

            <div className="form-row">
              <label>贈送條件：</label>
              <div className="tab-group">
                {Object.values(RULE_TYPE).map(t => (
                  <button
                    key={t.Value}
                    type="button"
                    className={`tab-btn ${form.RuleType === t.Value ? 'active' : ''}`}
                    onClick={() => update('RuleType', t.Value)}
                  >{t.Label}</button>
                ))}
              </div>
              <span className="hint">
                {form.RuleType === 'Threshold'
                  ? '與贈品同產線、同溫層購買達到指定金額門檻，即可獲得贈品。'
                  : '購買指定的商品達到指定數量，即可獲得贈品。'}
              </span>
            </div>

            {form.RuleType === 'Threshold' ? (
              <>
                <div className="form-row">
                  <label>贈送金額門檻：</label>
                  <input
                    type="number" className="form-input"
                    placeholder="請輸入贈送門檻的金額"
                    value={form.ThresholdAmount}
                    onChange={e => update('ThresholdAmount', Number(e.target.value))}
                  />
                </div>
                <div className="form-row">
                  <label>顯示提示金額：</label>
                  <input
                    type="number" className="form-input"
                    placeholder="請輸入達多少金額顯示提示"
                    value={form.HintAmount}
                    onChange={e => update('HintAmount', Number(e.target.value))}
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
                          checked={form.UseProductIds}
                          onChange={e => update('UseProductIds', e.target.checked)}
                        />
                        <span>用產品 ID</span>
                      </label>
                      <input
                        type="text"
                        className="form-input target-input"
                        placeholder="例如：75766, 75765"
                        value={productIdsText}
                        onChange={e => setProductIdsText(e.target.value)}
                        disabled={!form.UseProductIds}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setPreview('product')}
                        disabled={!form.UseProductIds}
                      >查看指定產品名稱</button>
                    </div>
                    <div className="target-line">
                      <label className="checkbox target-check">
                        <input
                          type="checkbox"
                          checked={form.UseSpecIds}
                          onChange={e => update('UseSpecIds', e.target.checked)}
                        />
                        <span>用規格 ID</span>
                      </label>
                      <input
                        type="text"
                        className="form-input target-input"
                        placeholder="例如：123459, 123464, 123465"
                        value={specIdsText}
                        onChange={e => setSpecIdsText(e.target.value)}
                        disabled={!form.UseSpecIds}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setPreview('spec')}
                        disabled={!form.UseSpecIds}
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
                    value={form.ThresholdQuantity}
                    onChange={e => update('ThresholdQuantity', Number(e.target.value))}
                  />
                </div>
              </>
            )}

            <div className="form-row">
              <label>贈送數量：</label>
              <input
                type="number" className="form-input"
                placeholder="請輸入贈送的數量"
                value={form.GiftQuantity}
                onChange={e => update('GiftQuantity', Number(e.target.value))}
              />
            </div>

            <div className="form-row">
              <label>可重複贈送：</label>
              <div className="radio-group">
                <label className="radio">
                  <input
                    type="radio"
                    checked={form.Repeatable === false}
                    onChange={() => update('Repeatable', false)}
                  />
                  <span>否</span>
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    checked={form.Repeatable === true}
                    onChange={() => update('Repeatable', true)}
                  />
                  <span>是</span>
                </label>
              </div>
              <span className="hint">
                {form.RuleType === 'Threshold'
                  ? '例如設定「滿 $1000 送 1 個」，選「是」則滿 $2000 送 2 個、$3000 送 3 個，以此類推。'
                  : '例如設定「買 3 件送 1 個」，選「是」則買 6 件送 2 個、9 件送 3 個，以此類推。'}
              </span>
            </div>

            <div className="form-row">
              <label>彈窗補充說明：</label>
              <textarea
                className="form-input"
                placeholder="請輸入會顯示在前台頁面的說明文字"
                rows={3}
                value={form.PopupText}
                onChange={e => update('PopupText', e.target.value)}
                style={{ width: 360 }}
              />
            </div>

            {isNew && (
              <>
                <div className="form-row">
                  <label>贈品名稱：</label>
                  <input
                    type="text" className="form-input"
                    value={form.ProductName}
                    onChange={e => update('ProductName', e.target.value)}
                    placeholder="請輸入贈品名稱"
                    style={{ width: 320 }}
                  />
                </div>
                <div className="form-row">
                  <label>產品 ID：</label>
                  <input
                    type="number" className="form-input"
                    value={form.ProductId}
                    onChange={e => update('ProductId', Number(e.target.value))}
                    placeholder="贈品所屬的產品 ID"
                  />
                </div>
                <div className="form-row">
                  <label>產線：</label>
                  <select
                    className="form-input"
                    value={form.ProductionLine}
                    onChange={e => update('ProductionLine', Number(e.target.value))}
                  >
                    {PRODUCTION_LINES.map(p => <option key={p.Value} value={p.Value}>{p.Label}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label>溫層：</label>
                  <select
                    className="form-input"
                    value={form.TemperatureLayer}
                    onChange={e => update('TemperatureLayer', Number(e.target.value))}
                  >
                    {TEMPERATURES.map(t => <option key={t.Value} value={t.Value}>{t.Label}</option>)}
                  </select>
                </div>
              </>
            )}

            <div className="form-actions-bar">
              <div className="time-info">
                <span>建立時間：{form.CreateTime || '—'} {form.CreateUser || ''}</span>
                <span>更新時間：{form.UpdateTime || '—'}</span>
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
                          <td>{info?.ProductName ?? <span style={{ color: '#dc4e43' }}>找不到此規格</span>}</td>
                          <td>{info?.Spec ?? '—'}</td>
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
