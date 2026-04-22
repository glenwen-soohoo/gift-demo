// 完全複製自線上 https://greenbox.tw/Orders/ConfirmOrder 的 #page-top
export default function PageTop() {
  return (
    <section id="page-top">
      <div className="container web-show">
        <div className="col-xs-2 p-0 titles">訂單結帳</div>
        <div className="col-xs-10 step">
          <span className="num">1</span>確認訂單 ------------
          <span className="num-empty">2</span>填寫資訊 ------------
          <span className="num-empty">3</span>訂購成功
        </div>
      </div>
      <div className="container mob-show">
        <div className="col-xs-12 p-0 titles">訂單結帳</div>
        <div className="col-xs-12 p-0 step">
          <span className="num">1</span>確認訂單 &gt;
          <span className="num-empty">2</span>填寫資訊 &gt;
          <span className="num-empty">3</span>訂購成功
        </div>
      </div>
    </section>
  )
}
