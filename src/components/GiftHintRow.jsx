// 快達門檻的提示列：「[產線名] 還差 XXX 元即可獲得贈品「xxx」」
//
// Props（Phase D）：hint: GiftHintItem
export default function GiftHintRow({ hint }) {
  if (!hint) return null
  const { Remaining, ProductionLineName, GiftName } = hint
  return (
    <section className="col-xs-12 order-field-basc gift-hint-row">
      <span className="gift-hint-text">
        {ProductionLineName} 還差 <strong>${Remaining.toLocaleString()}</strong> 元即可獲得贈品
        <span className="gift-hint-name">「{GiftName}」</span>
      </span>
    </section>
  )
}
