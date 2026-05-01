import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AboutPage from './pages/AboutPage'
import AlbumDetailPage from './pages/AlbumDetailPage'
import AlbumListPage from './pages/AlbumListPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import PhotoDetailPage from './pages/PhotoDetailPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/albums" element={<AlbumListPage />} />
          <Route path="/albums/:albumId" element={<AlbumDetailPage />} />
          <Route
            path="/albums/:albumId/:photoId"
            element={<PhotoDetailPage />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
