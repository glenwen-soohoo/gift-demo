import SAItem from './SAItem'

// 超值加購專區 — 仿線上結構
export default function SAArea({ saAreaId, items, onAdd }) {
  return (
    <div className="col-xs-12 p-0 cartorder" id={saAreaId}>
      <div className="panel panel-default">
        <div className="panel-heading">
          <div className="info_frame-title">
            <span className="info_frame-title-text">超值加購專區</span>
            <span className="info_frame-title-text sa-title-web">&emsp;(每樣加購商品至多購買一組)</span>
          </div>
        </div>
        <div className="panel-body">
          <div className="col-xs-12 sa-title-mob">每樣加購商品至多購買一組</div>
          <div className="col-xs-12 p-0 sa-pd-slick-frozen">
            {items.map(it => (
              <SAItem
                key={`${it.ProductId}-${it.ProductDetailId}`}
                item={it}
                onAdd={onAdd}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
