# T&K Photo V2 Upload Plan

Last updated: 2026-05-03
Branch: `v2-upload`

## 一、V2 目标和范围

### 核心目标

V2 的目标是在不破坏 V1 已上线静态摄影展版本的前提下，为 T 和 K 增加可登录、可创建相册、可上传照片、可自动提取 EXIF、可存储到云端、可写入数据库的能力，同时继续保留 V1 的线上摄影展风格与主要页面体验。

### V2 必做范围

1. 支持两位固定用户登录
2. 支持登录后创建相册
3. 支持登录后上传照片
4. 上传后自动提取并保存 EXIF
5. 照片文件存储到云端对象存储
6. 相册与照片元数据保存到数据库
7. 公开展示页继续沿用 V1 的展览式浏览体验
8. 尽量复用现有页面、路由、组件和视觉系统
9. 为后续多人协作上传预留扩展空间

### V2 暂不做范围

1. 不做复杂社交功能，如评论、点赞、收藏
2. 不做重度后台 CMS
3. 不做客户端图片编辑、裁切、滤镜
4. 不做 AI 图像分析或自动标签
5. 不做公开注册，先采用邀请制或管理员手动开通账号
6. 不做移动端原生 App

## 二、推荐技术栈

### 前端

- `Vite + React + TypeScript`
- `react-router-dom`，继续使用 `HashRouter`
- `Tailwind CSS`
- `Framer Motion`
- `@supabase/supabase-js`
- `react-hook-form`
- `zod`
- `exifr` 或浏览器端 `exifreader` 作为前端兜底读取方案

### 后端能力

- `Supabase Auth`
- `Supabase Postgres`
- `Supabase Storage`
- `Supabase Edge Functions`

### 图片与元数据处理

- 浏览器端上传前读取基础 EXIF，用于即时反馈
- 服务端以 Edge Function 或上传后任务为准，做最终 EXIF 入库
- 可选增加图片压缩库：
  - `browser-image-compression`
  - 或后续引入服务端压缩链路

### 工程配套

- `.env.local` / `.env.production`
- 数据访问层封装：
  - `src/lib/supabase.ts`
  - `src/services/albums.ts`
  - `src/services/photos.ts`
  - `src/services/auth.ts`

## 三、是否继续使用 Vite，还是迁移 Next.js

### 结论

推荐 V2 继续使用 Vite，不建议现在迁移到 Next.js。

### 原因

1. V1 已经稳定上线，当前页面结构、路由、视觉组件都基于 Vite SPA，继续沿用迁移成本最低。
2. V2 的核心新增能力是登录、上传、数据库、存储，而这些都可以直接由 Supabase 提供，不要求必须切到 SSR。
3. 现有站点部署在 GitHub Pages。若现在迁移 Next.js，通常需要同步迁移部署平台，范围会从“做上传版”扩大成“重构站点架构”。
4. 当前站点更偏个人作品展示与私域使用，SSR/SEO 并不是 V2 的关键收益点。
5. 继续使用 Vite，更容易平滑保留 `HashRouter`、现有页面与 GitHub Pages 兼容策略。

### 什么时候再考虑 Next.js

满足以下任一条件时，再评估 V3 或后续版本迁移：

1. 需要服务端渲染公开作品页提升 SEO
2. 需要复杂服务端权限判断
3. 需要服务端图片处理、动态 Open Graph、增量静态生成
4. 需要更复杂的后台系统与管理控制台

### V2 平滑策略

V2 先保持前端框架不变，只把数据源从静态文件逐步抽象为“静态数据 + Supabase 数据”的双轨结构。这样以后如果真的迁 Next.js，页面组件仍可复用。

## 四、Supabase 数据库表设计

### 设计原则

1. 与 V1 的 `Album` / `Photo` 类型尽量对齐
2. 支持先双人，再扩展多人
3. 支持公开展示和私有草稿两种状态
4. 支持 EXIF 原始值与展示值并存

### 1. `profiles`

用途：存储用户资料，与 Supabase Auth 用户一一对应。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `uuid` PK | 对应 `auth.users.id` |
| `display_name` | `text` | 展示名称，如 T / K |
| `slug` | `text` unique | 可读标识，后续多人扩展可用 |
| `role` | `text` | `owner` / `editor` / `viewer` |
| `is_active` | `boolean` | 账号是否可用 |
| `created_at` | `timestamptz` | 创建时间 |
| `updated_at` | `timestamptz` | 更新时间 |

### 2. `albums`

用途：相册主表。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `uuid` PK | 内部主键 |
| `slug` | `text` unique | URL 使用，保留 V1 的 `albumId` 语义 |
| `title` | `text` | 相册标题 |
| `subtitle` | `text` | 副标题 |
| `description` | `text` | 相册介绍 |
| `theme` | `text` | 对应现有 `AlbumTheme` |
| `cover_photo_id` | `uuid` nullable | 封面照片引用 |
| `cover_storage_path` | `text` nullable | 兜底封面路径 |
| `location` | `text` | 拍摄地点概述 |
| `shot_date` | `date` nullable | 主要拍摄日期 |
| `sort_date` | `date` | 相册排序日期 |
| `visibility` | `text` | `public` / `private` / `unlisted` |
| `status` | `text` | `draft` / `published` / `archived` |
| `created_by` | `uuid` FK | 创建人 |
| `updated_by` | `uuid` FK | 最后修改人 |
| `created_at` | `timestamptz` | 创建时间 |
| `updated_at` | `timestamptz` | 更新时间 |

### 3. `album_members`

用途：相册协作者权限，方便未来多人扩展。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `uuid` PK | 主键 |
| `album_id` | `uuid` FK | 相册 |
| `user_id` | `uuid` FK | 用户 |
| `role` | `text` | `owner` / `editor` / `viewer` |
| `created_at` | `timestamptz` | 创建时间 |

约束建议：

- `unique(album_id, user_id)`

### 4. `photos`

用途：照片主表。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `uuid` PK | 内部主键 |
| `album_id` | `uuid` FK | 所属相册 |
| `slug` | `text` | 对应 V1 的 `photoId` 语义 |
| `title` | `text` | 照片标题 |
| `description` | `text` | 照片说明 |
| `storage_path` | `text` | 原图存储路径 |
| `preview_path` | `text` nullable | 预览图路径 |
| `file_name` | `text` | 原始文件名 |
| `mime_type` | `text` | 文件类型 |
| `file_size_bytes` | `bigint` | 文件大小 |
| `width` | `integer` nullable | 像素宽 |
| `height` | `integer` nullable | 像素高 |
| `orientation` | `text` | `landscape` / `portrait` / `square` |
| `layout` | `text` | 继续沿用 `full` / `half` / `large` |
| `location` | `text` nullable | 拍摄地点 |
| `shot_at` | `timestamptz` nullable | 拍摄时间 |
| `display_order` | `integer` | 相册内排序 |
| `visibility` | `text` | `public` / `private` |
| `status` | `text` | `uploading` / `ready` / `failed` |
| `uploaded_by` | `uuid` FK | 上传人 |
| `created_at` | `timestamptz` | 创建时间 |
| `updated_at` | `timestamptz` | 更新时间 |

约束建议：

- `unique(album_id, slug)`

### 5. `photo_exif`

用途：照片 EXIF 独立表，避免 `photos` 表过宽，也便于后续扩展。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `photo_id` | `uuid` PK/FK | 对应照片 |
| `camera_make` | `text` nullable | 品牌 |
| `camera_model` | `text` nullable | 型号 |
| `lens_model` | `text` nullable | 镜头 |
| `aperture` | `text` nullable | 展示值，如 `f/2.8` |
| `shutter_speed` | `text` nullable | 展示值，如 `1/250s` |
| `iso` | `integer` nullable | ISO |
| `focal_length` | `text` nullable | 展示值，如 `35mm` |
| `taken_at_original` | `timestamptz` nullable | EXIF 原始拍摄时间 |
| `timezone_offset` | `text` nullable | 原始时区偏移 |
| `latitude` | `numeric` nullable | GPS 纬度 |
| `longitude` | `numeric` nullable | GPS 经度 |
| `raw_json` | `jsonb` nullable | 原始 EXIF 数据 |
| `parsed_at` | `timestamptz` nullable | 解析时间 |

### 6. 可选表：`upload_jobs`

用途：记录每批上传任务，便于调试失败、重试、统计。

V2 第一阶段不是必须，但推荐预留。

## 五、Supabase Storage 设计

### Bucket 建议

推荐至少拆成两个 bucket：

1. `photo-originals`
2. `photo-previews`

### 路径规范

建议统一路径结构：

`{albumSlug}/{photoId}/{filename}`

示例：

- `stone-and-eaves/uuid-1/stone-passage.jpg`
- `stone-and-eaves/uuid-1/preview.webp`

### 为什么不直接保留 V1 的 `/images/{albumId}/file.jpg`

因为 V2 上传后，文件名冲突、同名覆盖、后续重传版本控制会更麻烦。带 `photoId` 的路径更稳定。

### 公开策略

推荐方案：

1. `photo-originals` 先设为私有
2. `photo-previews` 可按需求决定是否公开
3. 前台公开展示优先使用预览图 URL
4. 原图下载与访问后续按权限控制

### V2 实用取舍

如果想先快速落地，也可以：

1. 第一阶段只建一个 bucket：`photos`
2. 存原图
3. 公开读取
4. 后续再补预览图生成

但更推荐从一开始就至少在数据模型里预留 `preview_path`。

## 六、登录和权限设计

### 登录方式

V2 推荐使用 Supabase Auth 的邮箱密码登录。

初期方案：

1. 手动创建两个用户账号
2. 关闭公开注册
3. 仅允许已开通用户登录

这样最简单，也最符合当前“双人使用”的范围。

### 权限模型

### 站点层权限

- 未登录用户：
  - 只能访问公开展示页
- 已登录用户：
  - 可以访问上传后台
- `owner`：
  - 可以管理全部相册与照片
- `editor`：
  - 可以上传与编辑有权限的相册

### 相册层权限

通过 `album_members` 控制：

- `owner`：可编辑、删除、发布
- `editor`：可上传、修改元数据、调整顺序
- `viewer`：仅查看后台，不可修改

### RLS 建议

所有核心表开启 RLS。

基础规则建议：

1. 公开前台查询只允许读 `status = 'published' and visibility = 'public'`
2. 登录用户只允许读取自己有成员关系的相册
3. 只有 `owner` / `editor` 可插入照片
4. 只有有权限的用户可写 Storage 路径

## 七、上传照片流程

### 推荐上传链路

1. 用户登录后台
2. 创建或选择一个相册
3. 选择多张照片
4. 前端先做基础校验：
   - 文件类型
   - 文件大小
   - 图片尺寸
5. 前端即时读取基础 EXIF，生成预览信息
6. 前端把文件上传到 Supabase Storage
7. 上传成功后写入 `photos` 基础记录
8. 触发 EXIF 解析流程
9. 解析成功后写入 `photo_exif`
10. 前端刷新相册详情与照片列表

### 推荐的写入顺序

最稳妥的方式是“两段式”：

1. 先上传文件到 Storage
2. 成功后再插入数据库

如果数据库先写、文件上传失败，容易产生脏数据。

### 状态管理建议

`photos.status` 使用以下状态：

- `uploading`
- `ready`
- `failed`

这样上传失败时能保留痕迹，也方便后台重试。

## 八、EXIF 自动读取方案

### 结论

推荐“前端即时读取 + 服务端最终入库”的双层方案。

### 方案 A：前端读取

优点：

1. 上传前就能显示拍摄时间、镜头、光圈等信息
2. 用户体验更好
3. 实现简单

缺点：

1. 浏览器解析结果可能不完全一致
2. 安全性和一致性不如服务端最终解析

适合用途：

- 上传预览
- 草稿态即时展示

### 方案 B：服务端读取

推荐用 Supabase Edge Function 处理：

1. 接收上传完成后的照片记录
2. 读取 Storage 文件
3. 解析 EXIF
4. 更新 `photos` 和 `photo_exif`

优点：

1. 数据统一
2. 可作为最终可信结果
3. 后续方便扩展压缩、水印、生成预览图

缺点：

1. 实现复杂度更高
2. 需要考虑执行时长与图片大小

### V2 推荐落地顺序

Phase 1：

1. 前端用 `exifr` 读取 EXIF
2. 上传后先把解析结果一并写入数据库

Phase 2：

1. 增加 Edge Function 做服务端二次校验与补全
2. 逐步把服务端结果作为最终来源

### EXIF 字段映射建议

V1 展示层主要依赖：

- `camera`
- `lens`
- `aperture`
- `shutterSpeed`
- `iso`
- `focalLength`
- `date`
- `location`

V2 保持这些展示字段不变，只把数据来源改成数据库。

## 九、需要保留的 V1 组件

以下组件和页面逻辑建议优先复用：

### 展示层组件

1. `Layout`
2. `Header`
3. `Footer`
4. `BackButton`
5. `GalleryHero`
6. `AlbumCard`
7. `AlbumGrid`
8. `PhotoWall`
9. `MotionImage`
10. `PhotoDetail`
11. `ExifPanel`

### 页面层

1. `HomePage`
2. `AlbumListPage`
3. `AlbumDetailPage`
4. `PhotoDetailPage`
5. `AboutPage`

### 可复用的核心思路

1. 相册和照片的视觉结构继续保留
2. 路由结构尽量不变
3. 现有 `Album` / `Photo` 类型可作为数据库 DTO 的参考
4. 图片展示样式继续保持：
   - 不圆角
   - 不阴影
   - 不强制裁切
   - 留白克制

## 十、需要新增的页面

### 最小后台页面集

1. `/login`
   - 登录页
2. `/studio`
   - 后台首页
3. `/studio/albums`
   - 我的相册列表
4. `/studio/albums/new`
   - 创建相册页
5. `/studio/albums/:albumId`
   - 相册管理页
6. `/studio/albums/:albumId/upload`
   - 照片上传页
7. `/studio/photos/:photoId`
   - 照片元数据编辑页

### 可选补充页面

1. `/studio/settings`
   - 账号设置
2. `/studio/albums/:albumId/edit`
   - 相册信息编辑
3. `/studio/albums/:albumId/sort`
   - 照片排序页

### 设计原则

后台页面不需要做成 SaaS 面板风，但也不建议完全照搬前台展览页。推荐做法是：

1. 保留 V1 的字体、色彩、留白体系
2. 交互上更偏编辑工作台
3. 前台是展览感，后台是克制的策展工作区

## 十一、V1 到 V2 的迁移步骤

### 总体策略

采用“前台不破、后台新增、数据双轨、逐步切换”的方式。

### 迁移步骤建议

1. 保持现有 V1 前台页面可继续运行
2. 新增 Supabase 配置与环境变量，但先不替换公开页数据源
3. 新增登录页与后台路由，和公开页路由隔离
4. 建立数据库表与 Storage bucket
5. 先打通“创建相册 + 上传照片 + 写数据库”
6. 再把公开展示页逐步改成从数据库读取
7. 在数据库数据稳定后，保留静态 `albums.ts` 作为迁移参考或回退基线

### 关于 V1 已上线版本

因为当前 V1 部署在 GitHub Pages，而 V2 需要登录、数据库和上传，最终很可能需要区分两类部署：

1. 公开前台：
   - 仍可部署在 GitHub Pages
2. 带登录与上传的 V2 应用：
   - 更适合部署到 Vercel / Netlify / Cloudflare Pages

### 关键判断

如果 V2 仍坚持部署在 GitHub Pages：

1. 前端调用 Supabase 没问题
2. 登录也没问题
3. 上传也基本可行
4. 但管理后台和环境配置会更绕，且未来扩展性较弱

更推荐的平滑方案：

1. V1 公开站继续保留 GitHub Pages
2. V2 上传版单独部署到 Vercel
3. 两者共享同一套 Supabase 数据

### 数据迁移建议

V1 现有 `src/data/albums.ts` 可以作为初始化种子来源：

1. 编写一次性导入脚本
2. 把现有 albums/photos 写入 Supabase
3. 图片继续先保留在 `public/images`
4. 第二步再批量迁入 Storage

这样可以先迁元数据，再迁文件。

## 十二、开发阶段拆分

### Phase 0：规划与底座

目标：

1. 明确表结构
2. 明确部署策略
3. 抽象数据访问层

交付：

1. `V2_UPLOAD_PLAN.md`
2. Supabase schema 草案
3. 环境变量约定

### Phase 1：Supabase 接入基础设施

目标：

1. 安装 Supabase SDK
2. 建立 `supabase.ts`
3. 建立 Auth / Albums / Photos service 层

交付：

1. 客户端初始化
2. 基础类型定义
3. 不影响 V1 前台的接入底座

### Phase 2：登录与路由隔离

目标：

1. 增加登录页
2. 增加受保护后台路由
3. 会话状态持久化

交付：

1. `/login`
2. `/studio`
3. route guard

### Phase 3：相册后台

目标：

1. 创建相册
2. 列出我的相册
3. 编辑相册基础信息

交付：

1. 相册 CRUD 的最小闭环

### Phase 4：照片上传闭环

目标：

1. 上传文件到 Storage
2. 写入 `photos`
3. 写入基础 EXIF

交付：

1. 多图上传页
2. 上传进度与失败反馈
3. 后台相册照片列表

### Phase 5：公开展示页切换数据库

目标：

1. 首页、相册页、照片详情页改为读 Supabase
2. 保留现有 UI 表现

交付：

1. 前台展示与数据库打通
2. 静态数据退居备用或迁移脚本输入

### Phase 6：EXIF 服务端补全与数据整理

目标：

1. 增加 Edge Function
2. 规范 EXIF 落库
3. 优化拍摄时间、地点和展示值

交付：

1. 更稳定的 EXIF 数据流

### Phase 7：发布与迁移收尾

目标：

1. 导入 V1 历史数据
2. 验证部署
3. 制定回退方案

交付：

1. 可用的 V2 上传版环境
2. 不影响 V1 展示站

## 十三、风险和注意事项

### 1. GitHub Pages 不再是 V2 最优部署平台

V1 适合 GitHub Pages，V2 不一定适合。上传和登录虽然能用，但后续维护体验不会太好。建议尽早决定是否把 V2 管理端迁到 Vercel。

### 2. 不能一开始就直接删掉静态数据

`src/data/albums.ts` 是当前稳定基线。迁移期间应保留，直到数据库版本完全验证通过。

### 3. 路由仍需谨慎

如果 V2 还跑在 GitHub Pages，继续使用 `HashRouter` 是最稳妥的。不要为了后台整洁 URL 贸然改成 `BrowserRouter`。

### 4. 图片路径体系要抽象

V1 的 `getImagePath()` 面向 `public/images`。V2 需要升级为统一图片 URL 解析层，能够同时兼容：

1. V1 本地静态图片
2. V2 Supabase Storage URL

### 5. EXIF 时间与时区可能不准

相机 EXIF 常见问题包括：

1. 时区缺失
2. 拍摄时间未校准
3. 手机照片字段格式不一致

因此数据库里建议同时保留：

1. 原始 EXIF 时间
2. 标准化后的展示时间

### 6. RLS 和 Storage 权限容易出错

V2 最容易卡住的不是 UI，而是：

1. 数据表 RLS
2. Storage bucket policy
3. 登录态下的上传权限

建议先做最小规则闭环，再逐步收紧。

### 7. 不要让后台样式破坏前台气质

新增后台时，注意区分“可编辑工作台”和“公开展览页”。后台可以更实用，但不能完全变成通用 SaaS 模板。

### 8. 文件体积与上传体验

高像素照片上传会带来：

1. 上传耗时
2. 手机端失败率
3. Storage 成本增加

建议 V2 早期就定义上传限制，如：

1. 单张上限
2. 支持格式
3. 是否自动压缩

### 9. URL 兼容性

如果公开前台继续沿用 V1 路由语义，数据库中的 `albums.slug` 和 `photos.slug` 应尽量保持和现有 URL 一致，避免未来链接失效。

### 10. 平滑迁移的最终建议

最推荐的 V2 方案是：

1. 前端框架继续用 Vite
2. 数据和存储接入 Supabase
3. 公开前台尽量复用 V1 页面
4. 新增 `/studio` 后台体系
5. V1 线上版本先不动
6. V2 在 `v2-upload` 分支独立推进

---

## 推荐的实施决策

如果后续交给 Codex 分阶段执行，建议按照以下顺序推进：

1. 先搭 Supabase 基础设施，不动公开业务页
2. 先做登录和后台路由，再做上传
3. 先让上传版把数据写进去，再切前台读取
4. 先以前端 EXIF 方案跑通，再补服务端解析
5. 先保证 V1 可回退，再逐步把 V2 变成主线
