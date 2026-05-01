import type { Album } from '../types'
import AlbumCard from './AlbumCard'

type AlbumGridProps = {
  albums: Album[]
}

function AlbumGrid({ albums }: AlbumGridProps) {
  return (
    <div className="grid grid-cols-1 gap-y-16 md:grid-cols-2 md:gap-x-12 md:gap-y-24 lg:gap-x-16 lg:gap-y-28">
      {albums.map((album, index) => {
        const isWide = index === 0 || index === 3

        return (
          <AlbumCard
            key={album.id}
            album={album}
            index={index}
            className={isWide ? 'md:col-span-2' : ''}
          />
        )
      })}
    </div>
  )
}

export default AlbumGrid
