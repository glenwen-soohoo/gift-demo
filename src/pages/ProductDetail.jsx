// 產品內頁 demo（米餅 ProductId=75762）
//
// 目的：示範「買就送 / 滿額贈」活動資訊應該顯示在「出貨日期」與「規格選擇」之間
// 範圍：版面只做到「腰帶（紅寶石奇異果 banner）」即可，下方商品敘述 / 評論不做
//
// 贈品區塊的標題用「productDescription banner」樣式（深綠橫條 + 白字置中），對齊
// fruit_web 既有 product detail page「無毒農檢驗 / 商品敘述 / 粥寶一起」那種大塊
// 段落標題的設計語言，視覺更醒目。
//
// 資料來源：
//   - 商品基本資料 → 直接寫死（沒有 75762 的 ProductDetail 假資料、不是 demo 重點）
//   - 「買就送活動資訊」內文 → 撈 TargetProductIds 包含本商品 + 上架中 BuyToGet 規則
//   - 「滿額贈活動資訊」內文 → 撈 ProductionLine + TemperatureLayer 都符合本商品 +
//     上架中 Threshold 規則（與 evaluateGifts 的 subtotal 範圍一致；買的商品要進得了
//     這條規則的小計才有意義，否則秀了也誤導）
//
// 米餅在 production 是「常溫」，但這份 demo 為了同時示範「買就送 + 滿額贈」兩個區塊，
// 把溫層配送顯示為「冷凍」（與 ConfirmOrder 購物車中的 米餅 一致），這樣
// `粥寶寶/冷凍/$2000` 滿額贈規則才會被匹配到。實作 fruit_web 時直接用真實的 ProductDetail
// 資料即可，不會有這個問題。

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGiftRules } from '../context/GiftRulesContext'
import { GIFT_RULE_STATE } from '../data/giftRules'
import { ProductCategoryEnum, TemperatureLayer } from '../data/fakeData'
import GiftInfoModal from '../components/GiftInfoModal'

const ICON = 'https://fruitbox.blob.core.windows.net/pagematerials/product/item-detail/icon_babyfood.png'
const KIWI_BANNER = 'https://greenboxcdn.azureedge.net/upload/Banner/202603190413111.png'

// 「productDescription」區塊用的標題 banner 圖（fruit_web 既有資產，產品內頁
// 「無毒農檢驗 / 商品敘述 / 粥寶一起」等大標都用這組圖）
const TITLE_BANNER_WEB = 'https://fruitbox.blob.core.windows.net/pagematerials/product/item-detail/title_web_babyfood.png'
const TITLE_BANNER_MOBILE = 'https://fruitbox.blob.core.windows.net/pagematerials/product/item-detail/title_mobile_babyfood.png'

// 產品圖片組（線上 slick carousel 的所有縮圖）
const PRODUCT_IMAGES = [
  'https://greenboxcdn.azureedge.net/upload/Album_3035/File/202604021019081.jpg',
  'https://greenboxcdn.azureedge.net/upload/Album_3035/File/202512030857581.png',
  'https://greenboxcdn.azureedge.net/upload/Album_3035/File/202512030858031.png',
  'https://greenboxcdn.azureedge.net/upload/Album_3035/File/202604021021251.png',
]

const PRODUCT_ID = 75762
const PRODUCT_NAME = '【限時免運】綜合米餅六入組'

// demo：產線、溫層（用於匹配滿額贈規則的 ProductionLine + TemperatureLayer）
// 真實 fruit_web 從 ProductDetail.ProductionLine + ProductDetail.TemperatureLayer 讀
const PRODUCT_PRODUCTION_LINE = ProductCategoryEnum.粥寶寶專區
const PRODUCT_TEMPERATURE = TemperatureLayer.冷凍   // demo 用冷凍（搭配 滿額贈/粥寶寶/冷凍 規則）

// 線上頁的 sub-line 標題列（icon + 文字）— 商品規格 / 適合月齡 / 溫層配送 等用
function SubLineTitle({ children, style = {} }) {
  return (
    <div className="col-xs-12 sub-line" style={style}>
      <img className="sub-title-icon" src={ICON} alt="" />
      <span className="sub-title" style={{ color: '#ef8e8e' }}>{children}</span>
    </div>
  )
}

// productDescription banner 標題 — 贈品活動資訊用
// 對齊 fruit_web 既有 product detail page「無毒農檢驗 / 商品敘述」那種大塊段落標題
function GiftBannerTitle({ children }) {
  return (
    <div className="pd-gift-banner-title col-xs-12 p-0">
      <img className="web-show" src={TITLE_BANNER_WEB} alt="" />
      <img className="mobile-show" src={TITLE_BANNER_MOBILE} alt="" />
      <span className="productDescription">{children}</span>
    </div>
  )
}

// 線上頁的條列項目（．+ 文字），可自訂顏色
// 用 flex 排版避免 Bootstrap 3 float-based grid 的 clearfix 麻煩
function BulletRow({ children, color, marker = '．', markerColor = '#ef8e8e' }) {
  return (
    <div className="pd-bullet-row">
      <span className="pd-bullet-marker" style={{ color: markerColor }}>{marker}</span>
      <span className="pd-bullet-text font-16px" style={color ? { color } : undefined}>
        {children}
      </span>
    </div>
  )
}

// 把同類型多條規則的 PopupText 渲染出來，規則之間插一條輕量 sub-divider
// 避免「兩條規則的條列文字直接連在一起、客人以為是同一個活動」的誤解
//
// onViewGift(rule)：點「查看贈品」按鈕時呼叫，開啟贈品說明彈窗（含贈品圖片）
function renderRulesWithSubDivider(rules, keyPrefix, onViewGift) {
  return rules.map((rule, ruleIdx) => {
    const lines = (rule.PopupText || '').split('\n').filter(Boolean)
    return (
      <div key={`${keyPrefix}-${rule.Id}`} className="pd-gift-rule-block">
        {ruleIdx > 0 && <div className="pd-gift-rule-divider" />}
        {lines.map((line, idx) => (
          <BulletRow key={`${keyPrefix}-${rule.Id}-${idx}`}>{line}</BulletRow>
        ))}
        <button
          type="button"
          className={`pd-gift-view-btn ${rule.ProductionLine === ProductCategoryEnum.粥寶寶專區 ? 'pd-gift-view-btn--pink' : ''}`}
          onClick={() => onViewGift(rule)}
        >
          查看贈品
        </button>
      </div>
    )
  })
}

export default function ProductDetail() {
  const { rules } = useGiftRules()
  const [activeImg, setActiveImg] = useState(0)

  // 「查看贈品」彈窗：把規則的贈品資訊（含圖片）丟給 GiftInfoModal 顯示
  // rule 用 RuleType（'Threshold'/'BuyToGet'），GiftInfoModal 讀 GiftType → 這裡轉名
  const [modalGift, setModalGift] = useState(null)
  const openGiftModal = (rule) => setModalGift({
    GiftType: rule.RuleType,
    DetailText: rule.DetailText,   // 彈窗顯示完整活動細則（產品頁直接條列用 PopupText 簡短版）
    Pic: rule.Pic,
    ProductName: rule.ProductName,
    ProductSpec: rule.ProductSpec,
    SpecSuffix: rule.SpecSuffix,
    GiftQuantity: rule.GiftQuantity,
  })

  // ── 找出「上架中、且 TargetProductIds 包含本商品」的買就送規則 ──
  // 對應 fruit_web 未來的：CartGiftService.GetActiveBuyToGetRulesForProduct(productId)
  const activeBuyToGetRules = rules.filter(r =>
    r.RuleType === 'BuyToGet' &&
    r.State === GIFT_RULE_STATE.上架中 &&
    Array.isArray(r.TargetProductIds) &&
    r.TargetProductIds.includes(PRODUCT_ID)
  )

  // ── 找出「上架中、產線+溫層都符合本商品」的滿額贈規則 ──
  // 對應 fruit_web 未來的：CartGiftService.GetActiveThresholdRulesForProduct(productId)
  const activeThresholdRules = rules.filter(r =>
    r.RuleType === 'Threshold' &&
    r.State === GIFT_RULE_STATE.上架中 &&
    r.ProductionLine === PRODUCT_PRODUCTION_LINE &&
    r.TemperatureLayer === PRODUCT_TEMPERATURE
  )

  return (
    // 注意：外層的 .container 與 .sb-site-container 由 ProductLayout 提供，
    // 這裡只放頁面內容，不再包一層 container（避免雙層 container 跑板）
    <>
      <div className="col-xs-12 m-t-20 p-0">
        <div className="row" style={{ padding: '0 8px' }}>
          {/* ────────── 左欄：商品圖 + 縮圖切換 + 貼心叮嚀（web-show）────────── */}
          <div className="col-md-6 col-xs-12 m-b-15">
            <div className="pd-img-static">
              <img src={PRODUCT_IMAGES[activeImg]} alt={PRODUCT_NAME} />
            </div>
            <div className="pd-thumb-row">
              {PRODUCT_IMAGES.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className={`pd-thumb-btn ${activeImg === i ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
            <div className="web-show">
              <SubLineTitle style={{ marginTop: 14 }}>貼心叮嚀</SubLineTitle>
              <BulletRow>1、本商品適合5個月以上寶寶手指食物。</BulletRow>
              <BulletRow>2、常溫保存12個月，正品保證效期4個月(120天)以上。</BulletRow>
              <BulletRow>3、寶寶食用時，請家長陪伴並留意吞嚥狀況。</BulletRow>
              <BulletRow>4、內有乾燥包不得食用，請家長留意。</BulletRow>
              <BulletRow>5、本產品與燕麥、芝麻及其製品於同一生產線，食品過敏者請留意。</BulletRow>
              <BulletRow>6、天然無添加建議開封後儘速食用完畢，避免濕氣致使產品軟化（如有軟化，可至烤箱微烤即可）</BulletRow>
              <BulletRow>7、此組合商品限時免運優惠。</BulletRow>
            </div>
          </div>

          {/* ────────── 右欄：商品名 / 評價 / 商品規格 / 適合月齡 / 溫層配送 / 出貨日期 / 贈品 / 規格選擇 / 價格購買 ────────── */}
          <div className="col-md-6 col-xs-12 m-b-15">
            <h2 className="itemtitle" style={{ marginBottom: 0, paddingBottom: 0 }}>
              {PRODUCT_NAME}
            </h2>

            <div className="score-area" style={{ borderBottom: '1px solid #b3b3b1' }}>
              <span className="star-icon"><i className="fa fa-star" /></span>
              <span className="star-icon"><i className="fa fa-star" /></span>
              <span className="star-icon"><i className="fa fa-star" /></span>
              <span className="star-icon"><i className="fa fa-star" /></span>
              <span className="star-icon"><i className="fa fa-star-half-full" /></span>
              <span className="score-text">4.91 / 5</span>
              <span className="comment-text">(11條評論)</span>
              <span className="comment-text" style={{ color: '#ef8e8e' }}>已售出 107 組</span>
            </div>

            <div style={{ padding: '8px 0 4px' }}>
              <span style={{ fontSize: 16, color: '#ef8e8e', borderBottom: '1px solid', paddingBottom: 1 }}>
                原產地：台灣
              </span>
            </div>

            <div className="itemcontent col-xs-12 p-0" style={{ color: '#333', fontSize: 16, marginBottom: 0 ,borderBottom: '1px solid #b3b3b1'}}>
              <SubLineTitle>商品規格</SubLineTitle>
              <BulletRow>約50±3克/包，香蕉、鳳梨、草莓米餅3口味共6包。</BulletRow>

              <SubLineTitle style={{ marginTop: 18 }}>適合月齡</SubLineTitle>
              <BulletRow>5個月以上寶寶</BulletRow>

              <SubLineTitle style={{ marginTop: 18 }}>溫層配送</SubLineTitle>
              <BulletRow>冷凍</BulletRow>

              <SubLineTitle style={{ marginTop: 18 }}>出貨日期</SubLineTitle>
              <BulletRow color="#e66154">04/28 ( 二 )，預計隔天到貨(星期日不到貨)</BulletRow>

              {/* ════════════════════════════════════════════════════════════════
                  贈品活動資訊區塊（贈品系統 demo 重點）

                  「買就送活動資訊」
                    顯示條件：本商品被某條上架中的買就送規則指定為觸發商品才會出現
                    fruit_web 對應：GetActiveBuyToGetRulesForProduct(productId)
                  「滿額贈活動資訊」
                    顯示條件：本商品的「產線 + 溫層」與某條上架中滿額贈規則的
                      ProductionLine + TemperatureLayer 都吻合才會出現
                    fruit_web 對應：GetActiveThresholdRulesForProduct(productId)

                  共同設計決定：
                    - 不顯示贈品名稱（rule.ProductName）。一個觸發商品可能對多條
                      規則，每條都掛贈品名版面會太長 — 後台已要求 PopupText 把活動
                      辦法寫清楚
                    - 同一型別內若有多條規則，規則之間插一條輕量 sub-divider 避免
                      「條列文字連在一起被誤解成同一個活動」（renderRulesWithSubDivider）
                    - 標題用 productDescription banner 樣式（深綠 banner + 白字置中），
                      跟「無毒農檢驗 / 商品敘述」同設計語言；視覺比 sub-line 醒目
                    - 沒有任何匹配規則時整個區塊不顯示（一般商品不出現）
                  ════════════════════════════════════════════════════════════════ */}
              {activeBuyToGetRules.length > 0 && (
                <>
                  <GiftBannerTitle>買就送活動資訊</GiftBannerTitle>
                  <div className="pd-gift-bullets">
                    {renderRulesWithSubDivider(activeBuyToGetRules, 'buytoget', openGiftModal)}
                  </div>
                </>
              )}

              {activeThresholdRules.length > 0 && (
                <>
                  <GiftBannerTitle>滿額贈活動資訊</GiftBannerTitle>
                  <div className="pd-gift-bullets">
                    {renderRulesWithSubDivider(activeThresholdRules, 'threshold', openGiftModal)}
                  </div>
                </>
              )}
            </div>

            <div className="spec-frame">
              <button type="button" className="spec-btn active">
                1 組 (3口味各2包，共6包)
              </button>
            </div>

            <div className="itemdetail">
              <div className="pd-price-qty-row">
                <div>
                  <span className="item-title">售價：</span>
                  <span style={{ color: '#d24c4c', fontSize: 22, fontWeight: 'bold' }}>$900</span>
                </div>
                <div>
                  <span className="item-title">數量：</span>
                  <select
                    defaultValue="1"
                    style={{
                      width: 60, height: 30,
                      border: '1px solid #ccc', borderRadius: 4,
                      fontSize: 16, paddingLeft: 12,
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                  <span style={{ color: '#ef8e8e', fontSize: 16, marginLeft: 12 }}>
                    剩餘 13 組
                  </span>
                </div>
              </div>

              <div className="pd-buy-btn-row">
                <a href="#" className="buybutton" onClick={e => e.preventDefault()}>
                  <i className="fa fa-shopping-basket" /> 加入菜籃
                </a>
                <a href="#" className="phonebuttonWeb" onClick={e => e.preventDefault()} title="電話訂購">
                  <i className="fa fa-phone" />
                </a>
                <a href="#" className="phonebuttonWeb" onClick={e => e.preventDefault()} title="LINE 訂購">
                  <i className="fa fa-comment" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 分隔線 — 必須 clear，否則會被上方 col-xs-12 的 float 推到頂端 */}
      <div className="m-t-20" style={{ borderBottom: '1px solid #b3b3b1', clear: 'both' }} />

      {/* 腰帶 — 寶石紅奇異果 banner */}
      <div className="col-xs-12 m-t-40 adArea" style={{ clear: 'both' }}>
        <a href="#" onClick={e => e.preventDefault()}>
          <img src={KIWI_BANNER} alt="寶石紅奇異果" style={{ width: '100%' }} />
        </a>
      </div>

      {/* Demo 提示 */}
      <div className="pd-demo-hint">
        <strong>Demo 範圍：</strong>
        本頁僅製作到「腰帶（寶石紅奇異果 banner）」為止，下方「商品敘述」「無毒農檢驗」等不在 demo 範圍內。
        重點示範：<span className="hl">「買就送活動資訊」與「滿額贈活動資訊」放在「出貨日期」與「規格選擇」之間，標題用 banner 樣式</span>。
        若看不到贈品區塊，請到 <Link to="/admin/gifts">/admin/gifts</Link> 確認有上架中規則。
      </div>

      <GiftInfoModal
        open={!!modalGift}
        giftItem={modalGift}
        onClose={() => setModalGift(null)}
      />
    </>
  )
}
