import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTop from '../components/PageTop'

// 完全比照線上 DOM 結構：
// <header> + <section id="page-top"> (白底全寬)
//   + <div class="sb-site-container"> (灰底全寬 #f2f2f2)
//       <form class="order-form">
//         <fieldset class="container p-0">  ← Bootstrap .container 1170px 自動置中
//           pd-area / ticket-use / next-step
//         </fieldset>
//       </form>
//   </div>
// + <footer>
export default function StoreLayout() {
  return (
    <>
      <Header />
      <PageTop />
      <div className="sb-site-container">
        <form action="#" className="order-form" id="form1" method="post" onSubmit={e => e.preventDefault()}>
          <fieldset className="container p-0">
            <Outlet />
          </fieldset>
        </form>
      </div>
      <Footer />
    </>
  )
}
