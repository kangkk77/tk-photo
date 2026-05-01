# T&K Photo — GitHub Pages 静态版开发规格说明

> 给 Codex 的开发文档。目标：用 Vite + React + TypeScript + Tailwind CSS + Framer Motion 开发一个摄影作品展示静态站点，部署到 GitHub Pages。

---

## 一、静态版 MVP 功能范围

### 必须做的功能

| 模块 | 功能 |
|------|------|
| 首页 | 网站入口，展示相册集列表，大封面卡片，错落布局，滚动淡入 |
| 相册集列表页 | 所有相册集的完整列表，按时间倒序排列 |
| 相册详情页 | 展览式布局浏览该相册所有照片，大量留白，不同尺寸错落排列 |
| 照片详情页 | 点击照片进入大图视图，展示完整 EXIF 拍摄参数 |
| 关于页面 | 介绍网站和拍摄者 |
| EXIF 展示 | 相机、镜头、光圈、快门、ISO、焦距、拍摄时间、地点 |
| 数据管理 | TypeScript 配置文件管理相册和照片数据 |
| 响应式 | 桌面端优先，移动端可用 |
| 深色/浅色主题 | 用户可切换 |
| GitHub Pages 部署 | GitHub Actions 自动构建部署 |

### 暂时不做的功能

- 用户系统（登录/注册/权限）
- 在线上传照片
- 数据库/后端 API
- 在线创建/编辑/删除相册集
- 标签系统和搜索
- 点赞/评论/收藏
- 多种浏览模式（只做展览式）
- 社交分享卡片
- 访问统计
- 密码访问
- 图片下载
- 批量操作

---

## 二、推荐技术栈

### 技术选型

| 用途 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 构建工具 | Vite | 5.x | 快速构建，HMR |
| 框架 | React | 18.x | 组件化开发 |
| 语言 | TypeScript | 5.x | 类型安全 |
| 路由 | react-router-dom | 6.x | SPA 客户端路由 |
| 样式 | Tailwind CSS | 3.x | 原子化 CSS |
| 动效 | Framer Motion | 10.x+ | 照片淡入、灯箱过渡 |
| 图标 | lucide-react | latest | 简洁线性图标 |
| 部署 | GitHub Pages | - | GitHub Actions CI/CD |

### 为什么选这套技术栈

1. **Vite + React + TypeScript**：标准组合，构建产物是纯静态文件，GitHub Pages 直接可用
2. **Tailwind CSS**：快速实现响应式布局和艺术化间距，不需要写大量自定义 CSS
3. **Framer Motion**：`whileInView` 实现滚动淡入，`AnimatePresence` 实现灯箱过渡，比纯 CSS 动画更灵活
4. **react-router-dom**：客户端路由，页面切换无刷新，体验更流畅
5. **GitHub Pages 免费**：零成本部署，push 代码自动上线

---

## 三、项目目录结构

```
tk-photo/
├── .github/
│   └── workflows/
│       └── deploy.yml                  # GitHub Pages 自动部署
├── public/
│   ├── images/
│   │   ├── golden-coast/               # 按相册 ID 建子目录
│   │   │   ├── cover.jpg               # 相册封面图
│   │   │   ├── sunset-rock.jpg         # 照片文件
│   │   │   ├── waves-crash.jpg
│   │   │   └── ...
│   │   ├── city-neon/
│   │   │   ├── cover.jpg
│   │   │   ├── rain-street.jpg
│   │   │   └── ...
│   │   └── ...
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Layout.tsx                  # 全局布局（Header + Outlet + Footer）
│   │   ├── Header.tsx                  # 网站头部导航栏
│   │   ├── Footer.tsx                  # 网站底部
│   │   ├── BackButton.tsx              # 返回按钮
│   │   ├── AlbumCard.tsx               # 首页相册集卡片
│   │   ├── AlbumGrid.tsx               # 首页相册集网格（错落布局）
│   │   ├── PhotoWall.tsx               # 相册详情页展览式照片墙
│   │   ├── PhotoDetail.tsx             # 照片详情页/大图视图
│   │   ├── ExifPanel.tsx               # EXIF 拍摄参数面板
│   │   ├── GalleryHero.tsx             # 页面顶部大图 Hero 区域
│   │   ├── MotionImage.tsx             # 带滚动淡入动效的图片组件
│   │   └── ThemeToggle.tsx             # 深色/浅色主题切换按钮
│   ├── data/
│   │   ├── albums.ts                   # 相册和照片数据（唯一数据源）
│   │   └── site.ts                     # 站点配置（标题、简介、作者信息）
│   ├── hooks/
│   │   └── useTheme.ts                 # 主题切换 hook（读写 localStorage）
│   ├── pages/
│   │   ├── HomePage.tsx                # 首页（/）
│   │   ├── AlbumListPage.tsx           # 相册集列表页（/albums）
│   │   ├── AlbumDetailPage.tsx         # 相册详情页（/albums/:albumId）
│   │   ├── PhotoDetailPage.tsx         # 照片详情页（/albums/:albumId/:photoId）
│   │   └── AboutPage.tsx               # 关于页面（/about）
│   ├── types/
│   │   └── index.ts                    # Album、Photo 等 TypeScript 类型定义
│   ├── styles/
│   │   └── global.css                  # 全局样式（字体声明、CSS 变量、基础重置）
│   ├── App.tsx                         # React Router 路由配置
│   └── main.tsx                        # Vite 入口文件
├── index.html                          # Vite HTML 模板
├── vite.config.ts                      # Vite 配置（含 base 路径）
├── tailwind.config.ts                  # Tailwind 配置（自定义颜色、字体）
├── postcss.config.js                   # PostCSS 配置
├── tsconfig.json                       # TypeScript 配置
├── package.json
└── README.md
```

### 目录约定

- `public/images/{albumId}/`：每个相册一个子目录，封面图命名为 `cover.jpg`
- `src/data/albums.ts`：唯一的数据库，新增照片只改这个文件
- `src/types/index.ts`：所有 TypeScript 类型集中定义
- `src/pages/`：每个页面一个文件，通过 React Router 映射路由
- `src/components/`：可复用的 UI 组件

---

## 四、数据结构设计

### 4.1 类型定义 `src/types/index.ts`

```typescript
/** 相册主题分类 */
export type AlbumTheme =
  | 'seascape'
  | 'sunset'
  | 'city'
  | 'portrait'
  | 'travel'
  | 'daily'
  | 'other';

/** 照片方向 */
export type PhotoOrientation = 'landscape' | 'portrait' | 'square';

/** 照片在展览式布局中的尺寸 */
export type PhotoLayout = 'full' | 'half' | 'large';

/** EXIF 拍摄参数 */
export interface ExifData {
  camera: string;          // 相机型号，如 "Sony A7M4"
  lens: string;            // 镜头型号，如 "FE 35mm F1.4 GM"
  aperture: string;        // 光圈值，如 "f/2.8"
  shutterSpeed: string;    // 快门速度，如 "1/500s"
  iso: number;             // ISO 值，如 100
  focalLength: string;     // 焦距，如 "35mm"
}

/** 单张照片 */
export interface Photo {
  id: string;                    // 唯一标识，用作路由参数，如 "sunset-rock"
  albumId: string;               // 所属相册 ID
  title: string;                 // 照片标题
  description: string;           // 照片描述/故事
  image: string;                 // 图片路径，如 "/images/golden-coast/sunset-rock.jpg"
  date: string;                  // 拍摄日期，如 "2024-06-15"
  location: string;              // 拍摄地点，如 "厦门·鼓浪屿"
  camera: string;                // 相机型号
  lens: string;                  // 镜头型号
  aperture: string;              // 光圈，如 "f/2.8"
  shutterSpeed: string;          // 快门，如 "1/500s"
  iso: number;                   // ISO 值
  focalLength: string;           // 焦距，如 "35mm"
  orientation: PhotoOrientation; // 照片方向
  layout: PhotoLayout;           // 展览式布局尺寸
}

/** 相册集 */
export interface Album {
  id: string;                    // 唯一标识，用作路由参数，如 "golden-coast"
  title: string;                 // 标题，如 "金色海岸"
  subtitle: string;              // 副标题，如 "2024 · 厦门"
  description: string;           // 简介，一段文字
  coverImage: string;            // 封面图路径
  theme: AlbumTheme;             // 主题分类
  date: string;                  // 创建日期，如 "2024-06-15"
  location: string;              // 拍摄地点概述
  photos: Photo[];               // 照片列表
}

/** 站点配置 */
export interface SiteConfig {
  title: string;                 // 网站标题
  subtitle: string;              // 网站副标题
  description: string;           // 网站描述
  authors: { name: string; role: string }[];  // 作者信息
  cameras: string[];             // 使用的相机
  lenses: string[];              // 使用的镜头
}
```

### 4.2 数据配置示例 `src/data/albums.ts`

```typescript
import { Album } from '../types';

export const albums: Album[] = [
  {
    id: 'golden-coast',
    title: '金色海岸',
    subtitle: '2024 · 厦门',
    description: '夏天的厦门，海浪和礁石在金色的光线下安静了下来。',
    coverImage: '/images/golden-coast/cover.jpg',
    theme: 'seascape',
    date: '2024-06-15',
    location: '厦门·鼓浪屿',
    photos: [
      {
        id: 'sunset-rock',
        albumId: 'golden-coast',
        title: '日落礁石',
        description: '日落前最后十分钟，整个海面被染成了金色。',
        image: '/images/golden-coast/sunset-rock.jpg',
        date: '2024-06-15',
        location: '厦门·鼓浪屿',
        camera: 'Sony A7M4',
        lens: 'FE 35mm F1.4 GM',
        aperture: 'f/8',
        shutterSpeed: '1/250s',
        iso: 100,
        focalLength: '35mm',
        orientation: 'landscape',
        layout: 'full',
      },
      {
        id: 'wave-crash',
        albumId: 'golden-coast',
        title: '浪花',
        description: '海浪拍打礁石的瞬间。',
        image: '/images/golden-coast/wave-crash.jpg',
        date: '2024-06-15',
        location: '厦门·环岛路',
        camera: 'Sony A7M4',
        lens: 'FE 70-200mm F2.8 GM II',
        aperture: 'f/4',
        shutterSpeed: '1/2000s',
        iso: 400,
        focalLength: '135mm',
        orientation: 'landscape',
        layout: 'half',
      },
    ],
  },
  // 更多相册...
];
```

### 4.3 站点配置 `src/data/site.ts`

```typescript
import { SiteConfig } from '../types';

export const siteConfig: SiteConfig = {
  title: 'T & K Photo',
  subtitle: '我们的摄影展厅',
  description: '用镜头记录生活的光与影。',
  authors: [
    { name: 'T', role: '摄影师' },
    { name: 'K', role: '摄影师' },
  ],
  cameras: ['Sony A7M4'],
  lenses: ['FE 35mm F1.4 GM', 'FE 70-200mm F2.8 GM II'],
};
```

### 4.4 数据文件结构（两个文件分离）

```
src/data/
├── albums.ts    # 相册和照片数据（数组）
└── site.ts      # 站点元数据（标题、作者等）
```

`albums.ts` 导出 `Album[]`，`site.ts` 导出 `SiteConfig`。页面通过 import 获取数据。

### 4.5 新增照片流程

1. 将照片放入 `public/images/{albumId}/` 目录
2. 在 `src/data/albums.ts` 中找到对应相册，在 `photos` 数组末尾添加 Photo 对象
3. 必填字段：`id`、`albumId`、`title`、`image`、`date`、`location`、`camera`、`lens`、`aperture`、`shutterSpeed`、`iso`、`focalLength`、`orientation`、`layout`
4. `description` 可以为空字符串
5. 提交代码，GitHub Actions 自动部署

---

## 五、页面结构

### 5.1 首页 `/` — `src/pages/HomePage.tsx`

**作用：** 网站入口，第一印象。展示网站标题和精选相册。

**展示内容：**
- 全屏 Hero 区域：网站标题 "T & K Photo" + 一句话副标题，背景用一张精选大图（带暗色遮罩）
- 精选相册区域：3-4 个相册的大封面卡片，错落排列
- 底部 Footer

**组件拆分：**
- `GalleryHero` — 全屏 Hero 区域
- `AlbumGrid` — 相册网格容器（控制错落布局）
- `AlbumCard` — 单个相册卡片
- `Footer` — 底部

**交互方式：**
- 页面加载时 Hero 区域标题淡入
- 滚动时 AlbumCard 逐个从下方淡入（Framer Motion `whileInView`）
- 鼠标悬停 AlbumCard：封面图轻微放大（scale 1.03），过渡 0.4s
- 点击 AlbumCard：React Router 导航到 `/albums/:albumId`

**艺术化设计重点：**
- Hero 区域占满首屏，标题居中，大字衬线体
- AlbumCard 之间间距 80-120px，绝对不挤
- 封面图保持原图比例，不做方形裁切
- 错落布局：第一个卡片全宽，第二三个半宽并排，第四个全宽

### 5.2 相册集列表页 `/albums` — `src/pages/AlbumListPage.tsx`

**作用：** 展示所有相册集的完整列表，按时间倒序排列。

**展示内容：**
- 页面标题："所有相册" 或 "Exhibitions"
- 全部相册列表，每个相册一个卡片
- 每个卡片：封面图 + 标题 + 副标题 + 照片数量 + 日期 + 地点

**组件拆分：**
- `BackButton` — 返回首页
- `AlbumGrid` — 相册网格
- `AlbumCard` — 单个相册卡片
- `Footer`

**交互方式：**
- 同首页的 AlbumCard 交互
- 可以考虑瀑布流布局（masonry），但第一版用错落 Grid 即可

**艺术化设计重点：**
- 页面顶部留白充足（至少 120px）
- 标题用大字衬线体
- 卡片列表简洁，不加边框，靠留白分隔

### 5.3 相册详情页 `/albums/:albumId` — `src/pages/AlbumDetailPage.tsx`

**作用：** 进入一个"展厅"，以展览式布局浏览该相册所有照片。

**展示内容：**
- 顶部 Hero 区域：相册标题（大字）+ 副标题 + 简介 + 日期 + 地点
- 照片展览区：照片以不同尺寸错落排列
  - `full`：占满整行宽度
  - `half`：占半行，两个 half 并排
  - `large`：占 2/3 宽度
- 每张照片下方显示标题（小字，灰色）
- 返回按钮

**路由：** 通过 `useParams().albumId` 获取相册 ID，从 `albums.ts` 中查找对应 Album

**组件拆分：**
- `BackButton` — 返回上一页
- `GalleryHero` — 相册 Hero 区域（标题、副标题、简介）
- `PhotoWall` — 展览式照片墙容器（控制布局）
- `MotionImage` — 单张带淡入动效的照片
- `Footer`

**交互方式：**
- 点击照片 → React Router 导航到 `/albums/:albumId/:photoId`
- 滚动时照片逐个从下方淡入（Framer Motion `whileInView`）
- 鼠标悬停照片：轻微放大 + 标题变色

**艺术化设计重点：**
- Hero 区域文字居左对齐，大标题 + 小号灰色副标题
- 照片间距 40-80px，根据 layout 类型动态调整
- 照片不做圆角、不做阴影，靠留白和背景色区分
- 照片下方标题用小号字体，灰色，衬线体

### 5.4 照片详情页 `/albums/:albumId/:photoId` — `src/pages/PhotoDetailPage.tsx`

**作用：** 展示单张照片大图及完整拍摄参数。

**展示内容：**
- 左侧/上方：照片大图（占大部分空间）
- 右侧/下方：EXIF 参数面板
  - 照片标题（大字）
  - 照片描述（一段话）
  - 拍摄日期
  - 拍摄地点
  - 相机型号
  - 镜头型号
  - 光圈 / 快门 / ISO / 焦距（一行显示或分行显示）
- 左右箭头：切换到上一张/下一张照片
- 返回按钮

**路由：** 通过 `useParams().albumId` 和 `useParams().photoId` 定位照片

**组件拆分：**
- `BackButton` — 返回相册详情页
- `PhotoDetail` — 照片大图展示区
- `ExifPanel` — EXIF 参数面板
- `Footer`

**交互方式：**
- 左右箭头按钮切换照片（React Router 导航到相邻照片的 URL）
- 键盘左右箭头切换照片（useEffect 监听 keydown）
- ESC 键返回相册详情页
- 页面加载时照片和参数面板分别淡入

**艺术化设计重点：**
- 大图为主，EXIF 面板不抢视觉焦点
- EXIF 参数用等宽字体（JetBrains Mono）
- 桌面端：左图右信息，6:4 或 7:3 比例
- 移动端：上图下信息
- 背景色与页面一致，面板无边框，靠间距分组

### 5.5 关于页面 `/about` — `src/pages/AboutPage.tsx`

**作用：** 介绍这个网站和你们。

**展示内容：**
- 页面标题："关于" 或 "About"
- 一段话介绍：你们是谁、为什么做这个网站
- 使用的器材：相机型号列表、镜头型号列表
- 可选：联系方式或社交媒体链接

**组件拆分：**
- `BackButton` — 返回首页
- `Footer`

**交互方式：**
- 页面加载时内容淡入

**艺术化设计重点：**
- 大量留白，文字居中或居左
- 衬线体标题 + 无衬线正文
- 器材列表用等宽字体

---

## 六、组件拆分

### 6.1 `Layout.tsx`

**职责：** 全局布局包裹组件。包含 Header、`<Outlet />`（React Router 页面出口）、Footer。

```tsx
// 路由结构中作为外层包裹
<Layout>
  <Header />
  <Outlet />    {/* 当前页面内容 */}
  <Footer />
</Layout>
```

### 6.2 `Header.tsx`

**职责：** 网站顶部导航栏。
- 左侧：网站标题 "T & K Photo"，点击回首页
- 右侧：导航链接（相册 Albums、关于 About）+ 主题切换按钮
- 样式：固定在顶部，半透明背景，滚动时加阴影

### 6.3 `Footer.tsx`

**职责：** 网站底部。
- 版权信息
- 一行小字："Shot with love"
- 样式：极简，小字灰色，居中

### 6.4 `BackButton.tsx`

**职责：** 返回按钮。使用 `react-router-dom` 的 `useNavigate()`。
- 左箭头图标 + "返回" 文字
- 点击调用 `navigate(-1)`

### 6.5 `AlbumCard.tsx`

**职责：** 首页和列表页的相册卡片。
- Props: `album: Album`
- 显示：封面图（全宽，保持比例）+ 标题 + 副标题 + 照片数量
- 交互：悬停放大、点击导航到 `/albums/:albumId`

### 6.6 `AlbumGrid.tsx`

**职责：** 相册卡片的网格容器，控制错落布局。
- Props: `albums: Album[]`
- 用 CSS Grid 实现错落排列：
  - 奇数卡片全宽 (`grid-column: span 2`)
  - 偶数卡片半宽 (`grid-column: span 1`)，两个并排
- 响应式：移动端全部单列

### 6.7 `PhotoWall.tsx`

**职责：** 相册详情页的展览式照片墙。
- Props: `photos: Photo[]`, `albumId: string`
- 根据每个 Photo 的 `layout` 字段决定尺寸：
  - `full`：整行
  - `half`：半行，两个并排
  - `large`：2/3 行
- 每张照片用 `MotionImage` 包裹
- 点击照片导航到 `/albums/:albumId/:photoId`

### 6.8 `PhotoDetail.tsx`

**职责：** 照片详情页的大图展示区。
- Props: `photo: Photo`
- 显示照片大图，`loading="eager"`（首屏需要立即加载）
- 图片宽度占满容器，高度自适应

### 6.9 `ExifPanel.tsx`

**职责：** EXIF 拍摄参数面板。
- Props: `photo: Photo`
- 显示所有拍摄参数，用网格或列表排列
- 每个参数：图标 + 标签 + 值
- 参数用等宽字体
- 如果某参数为空字符串，不显示该项

### 6.10 `GalleryHero.tsx`

**职责：** 页面顶部 Hero 区域。用于首页和相册详情页。
- Props: `title: string`, `subtitle?: string`, `description?: string`, `backgroundImage?: string`
- 有背景图时：背景图 + 暗色遮罩 + 白色文字居中
- 无背景图时：纯色背景 + 文字居左

### 6.11 `MotionImage.tsx`

**职责：** 带滚动淡入动效的图片组件。
- Props: `src: string`, `alt: string`, `className?: string`
- 使用 Framer Motion 的 `motion.img` + `whileInView`
- 进入视口时：opacity 0→1，y 20px→0，duration 0.6s，ease-out
- 图片 `loading="lazy"`

### 6.12 `ThemeToggle.tsx`

**职责：** 深色/浅色主题切换按钮。
- 使用 `useTheme` hook 读取和切换主题
- 图标：太阳/月亮（lucide-react 的 `Sun` / `Moon`）
- 切换时加一个简单的旋转或淡入动效
- 主题状态存储在 `localStorage`

---

## 七、第一版开发任务清单

### 任务 1：初始化项目

使用 Vite 创建 React + TypeScript 项目，安装所有依赖。

**具体操作：**
```bash
npm create vite@latest tk-photo -- --template react-ts
cd tk-photo
npm install react-router-dom framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**配置文件：**
- `tailwind.config.ts`：content 路径设为 `["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`
- `postcss.config.js`：配置 tailwindcss 和 autoprefixer
- `src/styles/global.css`：写入 `@tailwind base; @tailwind components; @tailwind utilities;`
- `vite.config.ts`：`base` 暂时设为 `'/'`（本地开发用）
- `src/main.tsx`：引入 `import './styles/global.css'`

**交付：** `npm run dev` 能启动，浏览器看到空白页面

### 任务 2：建立数据结构和类型

创建类型定义和示例数据。

**具体操作：**
- 创建 `src/types/index.ts`：写入 Album、Photo、SiteConfig 等类型定义（参考第四节）
- 创建 `src/data/albums.ts`：写入 2-3 个示例相册，每个相册 2-4 张照片
- 创建 `src/data/site.ts`：写入站点配置
- 在 `public/images/` 下创建对应目录，放入示例照片（可以用 placeholder 图片）

**交付：** TypeScript 编译通过，数据文件结构正确

### 任务 3：配置路由和基础布局

搭建 React Router 路由和全局布局。

**具体操作：**
- `src/App.tsx`：配置 React Router 路由表
  ```
  / → HomePage
  /albums → AlbumListPage
  /albums/:albumId → AlbumDetailPage
  /albums/:albumId/:photoId → PhotoDetailPage
  /about → AboutPage
  ```
- `src/components/Layout.tsx`：Header + Outlet + Footer 的包裹组件
- `src/components/Header.tsx`：简单的导航栏（标题 + 链接）
- `src/components/Footer.tsx`：简单底部
- `src/components/BackButton.tsx`：返回按钮
- `src/pages/HomePage.tsx`：先写一个占位 "首页"
- `src/pages/AlbumListPage.tsx`：先写一个占位
- `src/pages/AlbumDetailPage.tsx`：先写一个占位
- `src/pages/PhotoDetailPage.tsx`：先写一个占位
- `src/pages/AboutPage.tsx`：先写一个占位

**交付：** 页面间导航正常工作，URL 变化对应页面切换

### 任务 4：实现首页

完成首页的完整 UI。

**具体操作：**
- `GalleryHero.tsx`：全屏 Hero 区域，网站标题 + 副标题
- `AlbumCard.tsx`：相册卡片组件，封面图 + 标题 + 副标题 + 照片数量
- `AlbumGrid.tsx`：错落网格布局容器
- `HomePage.tsx`：组装 GalleryHero + AlbumGrid + Footer
- 从 `albums.ts` 导入数据，渲染前 3-4 个相册

**交付：** 首页展示完整的 Hero 和相册卡片列表

### 任务 5：实现相册集列表页

完成 `/albums` 页面。

**具体操作：**
- `AlbumListPage.tsx`：页面标题 + AlbumGrid 展示所有相册
- 从 `albums.ts` 导入全部数据

**交付：** `/albums` 页面显示所有相册卡片

### 任务 6：实现相册详情页

完成 `/albums/:albumId` 页面。

**具体操作：**
- `GalleryHero.tsx`：复用，但传入相册的标题、副标题、简介
- `MotionImage.tsx`：带淡入动效的图片组件
- `PhotoWall.tsx`：展览式照片墙，根据 `layout` 字段决定尺寸
- `AlbumDetailPage.tsx`：获取路由参数，查找相册数据，组装 GalleryHero + PhotoWall

**交付：** 点击相册卡片进入详情页，看到展览式照片排列

### 任务 7：实现照片详情页和 EXIF 面板

完成 `/albums/:albumId/:photoId` 页面。

**具体操作：**
- `ExifPanel.tsx`：EXIF 参数面板，显示所有拍摄参数
- `PhotoDetail.tsx`：大图展示组件
- `PhotoDetailPage.tsx`：获取路由参数，定位照片，组装 PhotoDetail + ExifPanel
- 左右箭头：计算上一张/下一张的 photoId，React Router 导航
- 键盘事件：useEffect 监听左右箭头和 ESC

**交付：** 点击照片进入详情页，看到大图和 EXIF 参数，可左右切换

### 任务 8：实现关于页面

完成 `/about` 页面。

**具体操作：**
- `AboutPage.tsx`：从 `site.ts` 读取作者和器材信息，渲染页面

**交付：** `/about` 页面显示网站介绍

### 任务 9：加入滚动动效和悬停效果

全局动效优化。

**具体操作：**
- `MotionImage.tsx`：确认 `whileInView` 淡入效果正常
- `AlbumCard.tsx`：加入悬停放大效果（Framer Motion `whileHover`）
- `GalleryHero.tsx`：标题加载时淡入
- `PhotoDetailPage.tsx`：照片和 EXIF 面板分别淡入
- 所有页面过渡：确保 Framer Motion 的 `AnimatePresence` 正确包裹路由

**交付：** 所有页面有流畅的淡入和悬停动效

### 任务 10：实现深色/浅色主题

**具体操作：**
- `src/hooks/useTheme.ts`：读取 localStorage，切换 `dark` class 到 `<html>`
- `ThemeToggle.tsx`：太阳/月亮图标按钮
- `tailwind.config.ts`：启用 `darkMode: 'class'`
- `global.css`：定义 CSS 变量的深色/浅色值
- 所有组件：使用 `dark:` 前缀或 CSS 变量适配深色模式

**交付：** 点击主题切换按钮，全站颜色切换

### 任务 11：响应式适配和细节打磨

**具体操作：**
- 所有页面：移动端（<768px）调整布局
  - AlbumGrid：改为单列
  - PhotoWall：改为单列，全宽
  - PhotoDetailPage：改为上图下信息
  - Header：导航链接折叠或简化
- 图片 `loading="lazy"` 确认生效
- `index.html`：配置 `<title>`、`<meta description>`、Open Graph 标签
- `public/favicon.ico`：添加网站图标
- 404 处理：React Router 配置 catch-all 路由或 `BrowserRouter` 的 `basename`

**交付：** 桌面端和移动端都可用，视觉完整

### 任务 12：配置 GitHub Pages 部署

**具体操作：**
- `vite.config.ts`：`base` 设为 `'/<仓库名>/'`
- 创建 `.github/workflows/deploy.yml`：GitHub Actions 自动构建部署
- 推送到 GitHub，确认 Actions 运行成功
- 访问 `https://<username>.github.io/<仓库名>/` 验证

**交付：** 网站在 GitHub Pages 上可访问

---

## 八、GitHub Pages 部署注意事项

### 8.1 Vite base 路径

GitHub Pages 的项目站点 URL 格式是 `https://<username>.github.io/<repo-name>/`，不是根路径。必须在 `vite.config.ts` 中配置 `base`：

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/tk-photo/',  // 替换为你的仓库名
});
```

如果使用自定义域名，`base` 设为 `'/'`。

### 8.2 构建命令

```bash
npm run build    # 输出到 dist/ 目录
```

### 8.3 部署方式：GitHub Actions（推荐）

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 8.4 GitHub 仓库设置

1. 进入仓库 Settings → Pages
2. Source 选择 "GitHub Actions"
3. 推送代码后 Actions 自动运行

### 8.5 SPA 路由问题

React Router 使用客户端路由，GitHub Pages 不支持服务器端 URL 重写。刷新非首页 URL 会 404。

**解决方案（二选一）：**

方案 A：使用 HashRouter 替代 BrowserRouter
```tsx
import { HashRouter } from 'react-router-dom';
// URL 格式变为 /#/albums/golden-coast
```

方案 B（推荐）：保持 BrowserRouter，添加 404 重定向
- 创建 `public/404.html`，内容为重定向脚本：
```html
<!DOCTYPE html>
<html>
  <script>
    // 将路径存入 query string，跳转到 index.html
    var path = location.pathname + location.search + location.hash;
    location.replace('/tk-photo/?p=' + encodeURIComponent(path));
  </script>
</html>
```
- 在 `index.html` 的 `<script>` 中读取 query string 并替换 URL：
```html
<script>
  (function() {
    var redirect = new URLSearchParams(location.search).get('p');
    if (redirect) {
      history.replaceState(null, '', redirect);
    }
  })();
</script>
```

推荐方案 A（HashRouter），最简单，零配置。

### 8.6 图片路径

所有图片放在 `public/images/` 下，引用时用绝对路径：
```typescript
image: '/images/golden-coast/sunset-rock.jpg'
```

Vite 构建时 `public/` 目录的文件会原样复制到 `dist/`。注意 `base` 配置会影响最终路径。

### 8.7 照片文件大小

GitHub 仓库限制 100MB 单文件，推荐仓库总大小控制在 1GB 以内。照片建议：
- 展示图：宽度 1600-2000px，JPEG 质量 80-85%，单张约 300-800KB
- 如果照片太多，考虑用 Git LFS 或外链（如 Cloudflare R2）

---

## 九、艺术感设计规范

### 9.1 设计原则

**四个关键词：留白、克制、质感、叙事**

1. **留白**：照片之间至少 40px 间距，页面边缘至少 48px padding，给视觉呼吸空间
2. **克制**：动效只用淡入和缓动，不用弹跳/旋转/花哨效果
3. **质感**：通过字体、颜色、间距传递品质感，不靠装饰
4. **叙事**：每张照片有标题和故事，不是冷冰冰的文件名

### 9.2 配色方案

#### 浅色主题（默认）

```
背景主色:    #FAFAF8  (米白，温暖不刺眼)
卡片背景:    #F2F0EC  (略深于背景)
主文字:      #1A1A1A  (近黑)
辅助文字:    #6B6B6B  (中灰)
弱化文字:    #A0A0A0  (浅灰)
点缀色:      #8B7355  (暖棕色，用于链接和 hover)
边框/分割线: #E8E4DE  (极浅灰棕)
```

#### 深色主题

```
背景主色:    #1A1A1A  (深灰)
卡片背景:    #242424  (略浅)
主文字:      #F0EDE8  (米白)
辅助文字:    #9A9A9A  (中灰)
弱化文字:    #666666
点缀色:      #C4A87A  (金色)
边框/分割线: #333333
```

### 9.3 字体方案

| 用途 | 字体 | 来源 | 说明 |
|------|------|------|------|
| 英文标题 | Playfair Display | Google Fonts | 衬线体，优雅 |
| 中文标题 | Noto Serif SC (思源宋体) | Google Fonts | 衬线体，文艺 |
| 正文 | 系统字体栈 | 本地 | `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| EXIF 参数 | JetBrains Mono | Google Fonts | 等宽字体，科技感 |

**在 `global.css` 中引入 Google Fonts：**
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Noto+Serif+SC:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

### 9.4 留白规范

```
页面左右 padding:     48px (桌面), 24px (移动端)
页面顶部到内容:       120px (桌面), 80px (移动端)
相册卡片间距:         80-120px
照片间距:             40-80px (根据 layout 调整)
段落间距:             24px
行高:                 1.7-1.8 (正文), 1.2 (大标题)
```

### 9.5 图片展示规范

- **不做方形裁切**：保持照片原图比例（3:2、2:3、16:9 等）
- **不做圆角**：照片边缘直角，干净利落
- **不做阴影**：靠留白和背景色区分照片与页面
- **不做边框**：照片直接放在背景色上
- **封面图**：宽度 1200-1600px，JPEG 质量 85%
- **展示图**：宽度 1600-2000px，JPEG 质量 85%

### 9.6 动效规范（只用三种）

**1. 滚动淡入（全局）**
- 效果：元素从下方 20px + 透明 0 渐变到原位 + 透明 1
- 触发：进入视口时（Intersection Observer）
- 持续时间：0.6s
- 缓动：ease-out
- 实现：Framer Motion `motion.div` + `whileInView`

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: 'easeOut' }}
  viewport={{ once: true, margin: '-50px' }}
>
```

**2. 悬停微放大（卡片和照片）**
- 效果：scale 1.02-1.03
- 持续时间：0.4s
- 缓动：ease
- 实现：Framer Motion `whileHover`

```tsx
<motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.4 }}>
```

**3. 页面/灯箱过渡**
- 效果：opacity 0→1，可选 scale 0.98→1
- 持续时间：0.3s
- 实现：Framer Motion `AnimatePresence`

**绝对不用：** 弹跳、旋转、打字机、粒子、视差滚动、3D 翻转

### 9.7 展览式布局模板

**首页 AlbumGrid 错落布局：**
```
┌─────────────────────────────────┐
│       AlbumCard (全宽)           │
├──────────────┬──────────────────┤
│  AlbumCard   │   AlbumCard      │
│  (半宽)      │   (半宽)         │
├──────────────┴──────────────────┤
│       AlbumCard (全宽)           │
└─────────────────────────────────┘
```

**相册详情页 PhotoWall 布局：**
```
┌─────────────────────────────────┐
│   Photo layout="full" (全宽)    │
├──────────────┬──────────────────┤
│  layout=half │   layout=half    │
├────────────────┬────────────────┤
│  layout=large  │ layout=half    │
│  (2/3)         │ (1/3)          │
├────────────────┴────────────────┤
│   Photo layout="full" (全宽)    │
└─────────────────────────────────┘
```

实现：Tailwind CSS Grid，每个 Photo 的 `layout` 字段决定 `grid-column: span N`

### 9.8 避免做成普通相册的方法

1. **不要用九宫格**：照片不等大，错落排列
2. **不要用方形裁切**：保持原图比例
3. **不要加边框和阴影**：靠留白分隔
4. **不要用彩色背景**：只用米白/深灰中性色
5. **不要堆信息**：照片下方只显示标题，EXIF 放详情页
6. **不要加花哨动效**：只用淡入，保持克制
7. **用衬线字体**：传递文艺感和品质感
8. **大留白**：照片之间空间感要足

### 9.9 参考网站

设计时参考以下网站的布局和感觉：
- [Unsplash](https://unsplash.com) — 大图、留白
- [1x.com](https://1x.com) — 摄影展览感
- [Cereal Magazine](https://www.thisiscereal.com) — 杂志排版
- [Kinfolk](https://kinfolk.com) — 极简留白

---

## 总结

| 项目 | 说明 |
|------|------|
| 技术栈 | Vite + React 18 + TypeScript + Tailwind CSS + Framer Motion |
| 部署 | GitHub Pages（GitHub Actions 自动部署） |
| 数据管理 | TypeScript 配置文件 (`src/data/albums.ts`) |
| 照片存放 | `public/images/{albumId}/` 目录 |
| 页面 | 首页、相册列表页、相册详情页、照片详情页、关于页 |
| 组件 | 12 个核心组件 |
| 开发任务 | 12 个任务，可依次执行 |
| 开发周期 | 约 10 天（每天 2-3 小时） |
| 成本 | 零 |

核心目标：静态、好看、可部署。展览式布局 + 大留白 + 优质字体 + 克制动效 = 摄影展的感觉。
