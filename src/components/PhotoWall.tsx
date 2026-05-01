import type { Photo } from '../types'
import MotionImage from './MotionImage'

type PhotoWallProps = {
  photos: Photo[]
}

function getSpanClass(photo: Photo) {
  if (photo.layout === 'full') {
    return 'md:col-span-6'
  }

  if (photo.layout === 'large') {
    return 'md:col-span-4'
  }

  return 'md:col-span-3'
}

function getOffsetClass(photo: Photo, index: number) {
  if (photo.layout === 'large' && index % 2 === 1) {
    return 'md:pt-16'
  }

  if (photo.layout === 'half' && index % 3 === 2) {
    return 'md:pt-10'
  }

  return ''
}

function PhotoWall({ photos }: PhotoWallProps) {
  return (
    <div className="grid grid-cols-1 gap-y-14 md:grid-cols-6 md:gap-x-10 md:gap-y-20 lg:gap-x-14 lg:gap-y-24">
      {photos.map((photo, index) => (
        <MotionImage
          key={photo.id}
          photo={photo}
          index={index}
          className={`${getSpanClass(photo)} ${getOffsetClass(photo, index)}`.trim()}
        />
      ))}
    </div>
  )
}

export default PhotoWall
