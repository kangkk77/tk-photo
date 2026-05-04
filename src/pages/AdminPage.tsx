import { useNavigate } from 'react-router-dom'
import AdminAlbumsPanel from '../components/AdminAlbumsPanel'
import { useAuth } from '../hooks/useAuth'

function AdminPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <section className="space-y-14 md:space-y-18">
      <div className="max-w-3xl space-y-5 pt-4 md:pt-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          私人工作台
        </p>
        <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
          V2 上传工作台
        </h1>
        <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
          这是和公开摄影展并行存在的后台工作区。你可以在这里继续整理作品集、
          编辑照片信息、补写随笔，并逐步把 V2 的上传管理能力打磨完整。
        </p>
      </div>

      <div className="grid gap-10 border-t border-subtle pt-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)] md:gap-x-14 md:pt-10">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">
              当前账号
            </p>
            <p className="font-serif text-2xl leading-tight text-ink md:text-3xl">
              {user?.email ?? '已登录用户'}
            </p>
          </div>
        </div>

        <aside className="space-y-5 border-t border-subtle/80 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-1">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            当前会话
          </p>
          <div className="space-y-5 text-sm leading-8 text-soft md:text-base">
            <p>
              后台路由已经由 Supabase Auth 保护，现在可以继续管理自己的相册、
              Storage 中的原图、照片说明、随笔和封面，而不会影响公开展示页。
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex min-w-28 items-center justify-center border border-subtle px-5 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent"
            >
              退出登录
            </button>
          </div>
        </aside>
      </div>

      <AdminAlbumsPanel />
    </section>
  )
}

export default AdminPage
