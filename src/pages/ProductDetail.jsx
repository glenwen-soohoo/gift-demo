// 產品內頁 demo（米餅 ProductId=75762）
//
// 目的：示範「買就送活動資訊」應該顯示在「出貨日期」與「規格選擇」之間
// 範圍：版面只做到「腰帶（紅寶石奇異果 banner）」即可，下方商品敘述 / 評論不做
// 資料來源：
//   - 商品基本資料 → 直接寫死（沒有 76542 的 ProductDetail 假資料、不是 demo 重點）
//   - 「買就送活動資訊」內文 → 從 GiftRulesContext 撈 TargetProductIds 包含 75762
//     且狀態為「上架中」的規則，串接其 PopupText（後台輸入的「活動辦法」）

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGiftRules } from '../context/GiftRulesContext'
import { GIFT_RULE_STATE } from '../data/giftRules'

const ICON = 'https://fruitbox.blob.core.windows.net/pagematerials/product/item-detail/icon_babyfood.png'
const KIWI_BANNER = 'https://greenboxcdn.azureedge.net/upload/Banner/202603190413111.png'

// 產品圖片組（線上 slick carousel 的所有縮圖）
const PRODUCT_IMAGES = [
  'https://greenboxcdn.azureedge.net/upload/Album_3035/File/202604021019081.jpg',
  'https://greenboxcdn.azureedge.net/upload/Album_3035/File/202512030857581.png',
  'https://greenboxcdn.azureedge.net/upload/Album_3035/File/202512030858031.png',
  'https://greenboxcdn.azureedge.net/upload/Album_3035/File/202604021021251.png',
]

const PRODUCT_ID = 75762
const PRODUCT_NAME = '【限時免運】綜合米餅六入組'

// 線上頁的 sub-line 標題列（icon + 文字）
function SubLineTitle({ children, style = {} }) {
  return (
    <div className="col-xs-12 sub-line" style={style}>
      <img className="sub-title-icon" src={ICON} alt="" />
      <span className="sub-title" style={{ color: '#ef8e8e' }}>{children}</span>
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

export default function ProductDetail() {
  const { rules } = useGiftRules()
  const [activeImg, setActiveImg] = useState(0)

  // ── 找出「上架中、且 TargetProductIds 包含本商品」的買就送規則 ──
  // 對應 fruit_web 未來的：CartGiftService.GetActiveBuyToGetRulesForProduct(productId)
  const activeBuyToGetRules = rules.filter(r =>
    r.RuleType === 'BuyToGet' &&
    r.State === GIFT_RULE_STATE.上架中 &&
    Array.isArray(r.TargetProductIds) &&
    r.TargetProductIds.includes(PRODUCT_ID)
  )

  return (
    // 注意：外層的 .container 與 .sb-site-container 由 ProductLayout 提供，
    // 這裡只放頁面內容，不再包一層 container（避免雙層 container 跑板）
    <>
      <div className="col-xs-12 m-t-20 p-0">
        <div className="row" style={{ padding: '0 8px' }}>
          {/* ────────── 左欄：商品圖 + 縮圖切換 + 貼心叮嚀（web-show）────────── */}
          <div className="col-md-6 col-xs-12 m-b-15">
            {/* 主圖 */}
            <div className="pd-img-static">
              <img src={PRODUCT_IMAGES[activeImg]} alt={PRODUCT_NAME} />
            </div>
            {/* 縮圖切換 row（線上是 slick-slider，這裡用簡化版） */}
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

            {/* 貼心叮嚀（線上 .web-show 區塊）*/}
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

          {/* ────────── 右欄：商品名 / 評價 / 商品規格 / 適合月齡 / 溫層配送 / 出貨日期 / 買就送 / 規格選擇 / 價格購買 ────────── */}
          <div className="col-md-6 col-xs-12 m-b-15">
            <h2 className="itemtitle" style={{ marginBottom: 0, paddingBottom: 0 }}>
              {PRODUCT_NAME}
            </h2>

            {/* 評價列 — 單行 inline：5 顆星 + 分數 + 評論 + 已售出 */}
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

            {/* 商品基本資訊區塊（所有 sub-line 都放這個 col-xs-12 wrapper 裡，
                共享同一個 sub-line marginTop 規律，避免間距不一致）*/}
            <div className="itemcontent col-xs-12 p-0" style={{ color: '#333', fontSize: 16, marginBottom: 0 }}>
              <SubLineTitle>商品規格</SubLineTitle>
              <BulletRow>約50±3克/包，香蕉、鳳梨、草莓米餅3口味共6包。</BulletRow>

              <SubLineTitle style={{ marginTop: 18 }}>適合月齡</SubLineTitle>
              <BulletRow>5個月以上寶寶</BulletRow>

              <SubLineTitle style={{ marginTop: 18 }}>溫層配送</SubLineTitle>
              <BulletRow>常溫</BulletRow>

              <SubLineTitle style={{ marginTop: 18 }}>出貨日期</SubLineTitle>
              <BulletRow color="#e66154">04/28 ( 二 )，預計隔天到貨(星期日不到貨)</BulletRow>

              {/* ════════════════════════════════════════════════════════════════
                  買就送活動資訊（贈品系統 demo 重點）

                  顯示條件：「本商品被某條上架中的買就送規則指定為觸發商品」才會出現
                    亦即 GiftRules 表中存在 RuleType==='BuyToGet' 且
                    TargetProductIds 包含當前 productId 的「上架中」規則。
                    → 不是所有產品頁都會出現，只有被「指定為買就送觸發商品」的才會出現

                  位置：出貨日期下方、規格選擇上方
                  格式：與「出貨日期」相同（SubLineTitle + BulletRow），無額外底色或框
                  內容：把符合條件的規則的 PopupText（後台輸入的「活動辦法」）
                        逐行展開為條列項目；多條規則就連續展開
                  註：刻意不顯示贈品名稱（rule.ProductName）。一條規則可指定多個觸發
                      商品、一個觸發商品也可被多條規則指定，若每條都掛贈品名版面會太長；
                      後台已要求 PopupText 把活動辦法寫清楚

                  fruit_web 對應：CartGiftService.GetActiveBuyToGetRulesForProduct(productId)
                  ════════════════════════════════════════════════════════════════ */}
              {activeBuyToGetRules.length > 0 && (
                <>
                  <SubLineTitle style={{ marginTop: 18 }}>買就送活動資訊</SubLineTitle>
                  {activeBuyToGetRules.flatMap(rule =>
                    (rule.PopupText || '')
                      .split('\n')
                      .filter(Boolean)
                      .map((line, idx) => (
                        <BulletRow key={`${rule.Id}-${idx}`}>{line}</BulletRow>
                      ))
                  )}
                </>
              )}
            </div>

            {/* 規格選擇（線上是 col-xs-6，桌面下是半寬）*/}
            <div className="spec-frame">
              <button type="button" className="spec-btn active">
                1 組 (3口味各2包，共6包)
              </button>
            </div>

            {/* 價格 / 數量 — 同一列；下方是購買按鈕 */}
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
        重點示範：<span className="hl">「買就送活動資訊」放在「出貨日期」與「規格選擇」之間</span>。
        若看不到此區塊，請到 <Link to="/admin/gifts">/admin/gifts</Link> 確認有上架中的買就送規則 TargetProductIds 包含 75762。
      </div>
    </>
  )
}
