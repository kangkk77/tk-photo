import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'

function Layout() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-32 md:px-12 md:pt-28">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
