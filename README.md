# T&K Photo

T&K Photo 是一个保留摄影展气质的作品展示与上传管理项目。

当前仓库已经进入 V2 阶段：
- 公开展示页继续保留 V1 的展览式浏览体验
- 私有后台支持登录、创建相册、上传照片、编辑说明与随笔、设置封面
- 公开页与后台共用 Supabase 基础设施，但仍保留静态 fallback，避免配置缺失时直接白屏

线上公开站点：
- `https://kangkk77.github.io/tk-photo/`

当前开发分支：
- `v2-upload`

## 当前能力

已经完成：
- 公开首页、相册列表、相册详情、照片详情
- 中英文切换
- Supabase Auth 登录
- 后台 `/admin` 相册管理
- 后台单张照片上传
- EXIF 读取与写入
- 照片说明、随笔 / 小记 / 拍摄故事编辑
- 相册封面设置
- 公开展示页优先读取 Supabase，保留静态 `src/data/albums.ts` fallback

当前首页规则：
- 未登录访问 `/`：显示固定 landing Hero 图和预设精选内容，不暴露后台测试相册
- 登录后访问 `/`：显示当前登录用户自己的相册

## 技术栈

- Vite
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- `react-router-dom` with `HashRouter`
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- GitHub Pages
- GitHub Actions

## Supabase 配置

### 1. 环境变量

本地运行需要以下环境变量：

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

请复制 `.env.example` 为 `.env` 或 `.env.local`，再填入你自己的 Supabase 项目信息。

注意：
- 不要使用 `service_role` key
- 不要提交真实 `.env`
- 仓库已经通过 `.gitignore` 忽略 `.env` 和 `.env.*`

### 2. 数据库 SQL

初始化或校验 Supabase 时，请按当前仓库内容确认以下文件：

- `supabase/schema.sql`
  作用：创建 `profiles`、`albums`、`photos`，启用 RLS，并配置基础策略
- `supabase/storage-policies.sql`
  作用：为 Storage bucket `photos` 配置公开读取和按 `userId/` 前缀写入权限
- `supabase/migrations/add_photo_note.sql`
  作用：给已有 `photos` 表补 `note` 字段

如果是全新项目：
1. 在 Supabase SQL Editor 执行 `supabase/schema.sql`
2. 在 Supabase SQL Editor 执行 `supabase/storage-policies.sql`

如果是已存在的旧 V2 项目：
1. 确保 `supabase/schema.sql` 已执行过
2. 确保 `supabase/storage-policies.sql` 已执行过
3. 再执行 `supabase/migrations/add_photo_note.sql`

### 3. Storage Bucket

当前使用的 bucket：
- `photos`

当前路径格式：
- `userId/albumId/photoId-original.ext`

例如：
- `e3.../a1.../9f...-original.jpg`

### 4. Auth 用户

当前 V2 采用 Supabase 邮箱密码登录。

你需要在 Supabase Auth 中提前准备可登录用户，后台登录页使用：
- `/#/login`

## GitHub Pages 和 GitHub Secrets

当前部署工作流位于：
- [.github/workflows/deploy.yml](/E:/T&K_photo/.github/workflows/deploy.yml)

GitHub Actions 构建时需要在仓库 `Settings -> Secrets and variables -> Actions` 中配置：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

如果没有这两个 Secrets：
- 公开页可能只能退回静态 fallback
- 登录、后台管理、上传和 Supabase 查询不会正常工作

## 本地运行

环境要求：
- Node.js 20 或更高
- npm

安装依赖：

```bash
npm ci
```

准备本地环境变量：

```bash
copy .env.example .env
```

然后填写：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

启动开发环境：

```bash
npm run dev
```

本地预览地址通常为：
- `http://localhost:5173/#/`

生产构建：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## 如何使用 V2 后台

### 创建相册

1. 打开 `/#/login`
2. 使用 Supabase Auth 用户登录
3. 进入 `/#/admin`
4. 在相册创建区域填写：
   - 标题
   - 副标题
   - 说明
   - 主题
   - 日期
   - 地点
   - 可见性
5. 提交后会出现在“我的相册”列表

### 上传照片

1. 在 `/#/admin` 进入某个相册的照片管理区域
2. 选择一张图片文件
3. 可选填写标题和简短说明
4. 点击上传
5. 上传成功后：
   - 文件会进入 Supabase Storage
   - `photos` 表会新增记录
   - EXIF 会尽量自动读取

### 编辑说明与随笔

在后台照片列表中点击“编辑信息”后，可以继续维护：
- 标题
- 说明
- 随笔 / 小记 / 拍摄故事
- 日期
- 地点
- 展示布局

注意：
- 编辑这些字段不会主动覆盖原 EXIF 字段

### 设置相册封面

在后台照片列表中，可以对某张照片点击“设为封面”。

设置后：
- 不会重复上传文件
- 只会更新 `albums.cover_image`

## 公开展示页说明

当前公开路由：
- `/#/`
- `/#/albums`
- `/#/albums/:albumId`
- `/#/albums/:albumId/:photoId`
- `/#/about`

当前行为：
- `/` 首页已经按登录状态分流
- `/albums`、相册详情、照片详情仍按公开展示逻辑工作
- 公开展示页通过 `src/services/galleryService.ts` 读数据
- `src/data/albums.ts` 仍然保留为静态 fallback，不要删除

## 重要文件

- `src/data/albums.ts`
  公开展示页的静态 fallback 数据
- `src/data/landing.ts`
  未登录首页的固定 Hero 图与预设精选内容
- `src/data/site.ts`
  站点级文案和作者信息
- `src/services/galleryService.ts`
  公开展示页统一数据访问层
- `src/services/albumRepository.ts`
  后台相册管理
- `src/services/photoRepository.ts`
  后台照片上传与编辑
- `src/lib/supabaseClient.ts`
  Supabase 客户端初始化
- `src/i18n/dictionaries.ts`
  中英文文案字典

## 图片路径规则

静态数据中不要写：
- `/images/...`
- `images/...`

应该写相对片段，例如：
- `stone-and-eaves/pagoda-rise.jpg`

运行时统一通过：
- `src/utils/paths.ts` 中的 `getImagePath()`

这样可以同时兼容：
- 本地开发环境 `/`
- GitHub Pages 生产环境 `/tk-photo/`
- Supabase public URL 直出

## 安全与提交注意事项

- 不要提交真实 `.env`
- 不要在前端使用 `service_role` key
- 后台和公开展示共用同一套 Supabase 时，优先依赖 RLS 和 Storage policy
- 每次完成一轮修改后，请运行：

```bash
npm run build
```

## 已检查的收尾项

- README 已更新为 V2 说明
- 已说明 Supabase 本地配置方法
- 已说明 GitHub Secrets 需要 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
- 已说明本地运行方法
- 已说明如何创建相册、上传照片、编辑随笔
- `.env` 默认被忽略，不应提交
