import { useI18n } from '../hooks/useI18n'

function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-subtle">
      <div className="mx-auto flex w-full max-w-6xl justify-center px-6 py-10 text-center text-sm text-muted md:px-12">
        <p>{t('footer.description')}</p>
      </div>
    </footer>
  )
}

export default Footer
