import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type BackButtonProps = {
  fallbackTo?: string
}

function BackButton({ fallbackTo = '/' }: BackButtonProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate(fallbackTo)
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="mb-10 inline-flex items-center gap-2 text-sm text-soft transition-colors hover:text-accent"
    >
      <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
      <span>Back</span>
    </button>
  )
}

export default BackButton
