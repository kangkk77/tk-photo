# GitHub Pages 技术方案审查报告

> 审查日期：2026-04-30
> 审查范围：Vite + React + TypeScript + Tailwind CSS + Framer Motion + react-router-dom 部署到 GitHub Pages

---

## 1. Vite base 路径处理

### 问题

GitHub Pages 项目站点 URL 格式为 `https://<username>.github.io/<repo-name>/`，不是域名根路径。如果 `vite.config.ts` 的 `base` 配置不当，所有静态资源（JS/CSS/图片/字体）的路径都会错。

### 分析

PROJECT_PLAN.md 第 728 行已提到需要配置 `base: '/tk-photo/'`，但有一个**致命遗漏**：本地开发和生产构建需要的 `base` 值不同。

| 环境 | base 值 | 原因 |
|------|---------|------|
| `npm run dev`（本地） | `/` | Vite dev server 从根路径提供服务 |
| `npm run build`（生产） | `/repo-name/` | GitHub Pages 的子路径部署 |

如果直接写死 `base: '/tk-photo/'`，本地 `npm run dev` 时所有资源路径都会错误（Vite dev server 不认识 `/tk-photo/` 前缀）。

### 推荐方案

**根据环境变量动态设置 base：**

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/tk-photo/' : '/',
}));
```

或者更精确地，GitHub Actions 构建时永远在 `production` mode，所以用 `process.env.NODE_ENV` 判断也行。但如果以后有 staging 环境，推荐用自定义环境变量：

```typescript
base: process.env.VITE_BASE_URL || '/',
```

然后在 GitHub Actions deploy.yml 中设置 `VITE_BASE_URL=/tk-photo/`。

### 结论

方案可行，但需要做**条件 base**，否则本地开发和线上部署会互相冲突。

---

## 2. React Router 在 GitHub Pages 刷新 404

### 问题

React Router 是客户端路由。当用户直接访问 `/albums/golden-coast` 或在页面上刷新时，浏览器向 GitHub Pages 服务器请求 `/albums/golden-coast`，但服务器上只有 `index.html`、JS 文件等静态资源，没有这个目录/文件，于是返回 404。

PROJECT_PLAN.md 第 820-850 行提到了两种方案。这里做深入评估。

### 方案 A：HashRouter（推荐）

```
URL 格式：https://username.github.io/tk-photo/#/albums/golden-coast
```

**优点：**
- 零配置，永远不会 404
- GitHub Pages 只负责返回 `index.html`，`#` 之后的路径完全由浏览器处理
- 不需要 404.html 黑魔法
- 稳定可靠，没有任何边界情况

**缺点：**
- URL 中有 `#` 号（对摄影网站来说视觉影响极小，用户看照片不会在意 URL）
- 不利于 SEO（但对于个人摄影站，SEO 通常不是刚需，且 Google 对 `#` URL 的处理能力有限）

**结论：对于摄影展示站，HashRouter 是最务实的选择。** SPA 路由 404 的解决成本远高于 `#` 号带来的审美损失。

### 方案 B：BrowserRouter + 404.html 重定向

```
URL 格式：https://username.github.io/tk-photo/albums/golden-coast
```

PROJECT_PLAN.md 第 826-847 行描述了这个方案的原理：利用 GitHub Pages 的 `404.html` 作为 catch-all 路由。

**优点：**
- URL 干净，没有 `#`

**缺点：**
- **Vite 不会自动把 `public/404.html` 复制到 `dist/`**：这是关键坑。Vite 只处理 `index.html` 作为入口。你需要手动确保 `404.html` 出现在构建产物中，或者利用 GitHub Pages 的机制：GitHub Pages 会自动在项目根目录找 `404.html`，所以需要确保 `dist/404.html` 存在。
- URL 有短暂闪烁：`/?p=/albums/golden-coast` → `history.replaceState` → 恢复原 URL。用户可能看到地址栏变化。
- 搜索引擎可能混淆：Google 会抓取到 `/?p=...` 的 URL，需要正确的 canonical 标签。
- SSG 兼容性差：如果以后改用 SSG（如 Astro），这套 404 方案就不工作了。

**实现要点：**

```html
<!-- public/404.html - 放在 public/ 目录，构建时会复制到 dist/ -->
<!DOCTYPE html>
<html>
<meta charset="utf-8">
<script>
  sessionStorage.redirect = location.pathname + location.search + location.hash;
  location.replace('/tk-photo/');
</script>
</html>
```

```html
<!-- index.html 中额外加一段 script -->
<script>
  (function() {
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect !== location.pathname) {
      history.replaceState(null, '', redirect);
    }
  })();
</script>
```

⚠️ 注意：这个方案的 `404.html` 中路径必须是 `'/tk-photo/'`（带 base），否则替换会失败。

### 最终推荐

**使用 HashRouter。** 对于一个摄影作品展示网站，URL 干净不是核心需求，稳定性才是。`#` 号在现代 Web 中并不突兀，很多大型摄影网站也使用 HashRouter。

---

## 3. 图片路径怎么写

### 核心问题

这是**整个方案中最容易出错的点**，PROJECT_PLAN.md 中没有充分警示。

`src/data/albums.ts` 中定义的图片路径是一个**纯字符串**：

```typescript
image: '/images/golden-coast/sunset-rock.jpg'
```

在 JSX 中使用时：

```tsx
<img src={photo.image} />
```

渲染成：

```html
<img src="/images/golden-coast/sunset-rock.jpg">
```

### 为什么在 GitHub Pages 上会炸

浏览器解析 `<img src="/images/...">` 时，`/` 指向的是**域名根目录**。

| 环境 | 域名根 | 实际文件位置 | 结果 |
|------|--------|------------|------|
| 本地 dev (`npm run dev`) | `http://localhost:5173/` | `public/images/...` | ✅ 正确 |
| GitHub Pages (base=`/tk-photo/`) | `https://username.github.io/` | `https://username.github.io/tk-photo/images/...` | ❌ 404 |

浏览器会去 `https://username.github.io/images/golden-coast/sunset-rock.jpg` 找文件，但文件实际在 `https://username.github.io/tk-photo/images/golden-coast/sunset-rock.jpg`。

**Vite 的 base 配置不会自动转换 JS 字符串中的路径。** Vite 只转换以下场景的路径：
- HTML 文件中的 `<link>`、`<script>`、`<img>` 等
- CSS 中的 `url()` 引用
- `import` 语句引入的静态资源

JS 中的字符串 `/images/...` 是运行时文本，Vite 不会碰它。

### 推荐方案（核心解法）

**不要把绝对路径写死在数据文件中。** 改用相对路径片段 + 运行时拼接：

**方案 A：只在数据文件存文件名，组件中拼接（推荐）**

```typescript
// src/data/albums.ts
{
  image: 'golden-coast/sunset-rock.jpg',  // 相对路径片段，不带前导 /
}
```

```tsx
// 组件中拼接
import.meta.env.BASE_URL + 'images/' + photo.image
// 开发环境：'/images/golden-coast/sunset-rock.jpg'
// 生产环境（base='/tk-photo/'）：'/tk-photo/images/golden-coast/sunset-rock.jpg'
```

这利用 Vite 的 `import.meta.env.BASE_URL` 在构建时被替换为 `base` 值的特性。而且这个值在 dev 和 production 模式下不同，天然支持不同环境。

**方案 B：包装一个 `getImagePath()` 工具函数**

```typescript
// src/utils/paths.ts
export function getImagePath(relativePath: string): string {
  return `${import.meta.env.BASE_URL}images/${relativePath}`;
}
```

```tsx
<img src={getImagePath(photo.image)} />
```

**方案 C：组件层面处理（最灵活）**

```tsx
// src/components/ImageWithBase.tsx
function ImageWithBase({ relativePath, alt, ...props }: ImgHTMLAttributes & { relativePath: string }) {
  return <img src={`${import.meta.env.BASE_URL}images/${relativePath}`} alt={alt} {...props} />;
}
```

### 最终推荐

**方案 B（工具函数）**。集中管理路径拼接逻辑，后续如果切换到 Supabase Storage，只需要改一个函数。

### 额外提醒

- **封面图路径同理**：`coverImage` 字段也要用同样的方式处理
- **favicon.ico**：`public/favicon.ico` 在 `index.html` 中引用时，Vite 会自动加上 base 前缀，不需要特殊处理
- **字体链接（Google Fonts）**：`@import url('https://fonts.googleapis.com/...')` 是外部 URL，不受 base 影响，不需要改

---

## 4. BrowserRouter vs HashRouter

### 综合对比

| 维度 | BrowserRouter | HashRouter |
|------|--------------|------------|
| URL 格式 | `/albums/golden-coast` | `/#/albums/golden-coast` |
| 刷新 404 | ❌ 需要 404.html 黑魔法 | ✅ 永远不会 404 |
| SEO | ✅ 略好 | ❌ 对 SEO 不友好 |
| 实现复杂度 | 高 | 低 |
| 维护成本 | 高 | 低 |
| 迁移到 SSG | 快 | 需要改路由 |
| 迁移到自有服务器 + Nginx | 快 | 需要配置 |

### 推荐

**使用 HashRouter。** 在 GitHub Pages 这个特定平台上，HashRouter 是唯一可以零配置解决 SPA 路由 404 的方案。摄影展示网站的 URL 不是产品核心，`#` 号无关紧要。

如果你**极度讨厌 `#`**，BrowserRouter + 404.html 方案可行但脆弱，需要测试以下边界情况：
1. 子路由刷新（`/albums/golden-coast/photo-id`）是否能正确恢复
2. 带 query string 的 URL（`/albums?page=2`）刷新后是否正常
3. 深色/浅色主题切换时，刷新是否保持状态
4. 搜索引擎爬虫是否能正确索引

### 代码改动量

```diff
- import { BrowserRouter } from 'react-router-dom';
+ import { HashRouter } from 'react-router-dom';

- <BrowserRouter>
+ <HashRouter>
```

就这两行改动。其他所有代码（`useParams`、`Link`、`navigate`）都不用改。

---

## 5. TypeScript 数据文件是否适合管理相册和照片

### 优点

- **类型安全**：IDE 自动补全、类型校验，添加新照片时有 TypeScript 兜底
- **零运行时开销**：编译后就变成了普通 JS 对象，没有 JSON.parse 开销
- **模块化**：可以 import 其他 TS 文件辅助（如日期格式化、路径拼接等）
- **Git 友好**：数据结构变更有 diff 可读
- **开发体验好**：直接在 Vite 的 HMR 中生效，改了数据页面立即更新

### 缺点与限制

1. **每次新增/修改照片都需要重新构建部署**：这是方案选择的结果，不是技术问题。对个人摄影站完全可接受。
2. **文件体积**：如果一个 TS 文件包含上百张照片的 EXIF 数据，文件可读性会下降。建议超过 200 行就按相册拆分。
3. **没有管理后台**：这是静态站的固有特性，不是 TS 数据文件的问题。

### 建议优化

**数据文件结构改进：**

```
src/data/
├── albums.ts       # 重新导出 index
├── index.ts        # 聚合导出
├── golden-coast.ts # 单个相册的数据
├── city-neon.ts
└── site.ts
```

每个相册单独一个文件，`index.ts` 统一导出：

```typescript
// src/data/index.ts
import { Album } from '../types';
import { goldenCoast } from './golden-coast';
import { cityNeon } from './city-neon';

export const albums: Album[] = [goldenCoast, cityNeon];
```

**好处：**
- 单个相册文件保持在 50-100 行，可读性好
- 多人协作时减少冲突
- 未来迁移到 Supabase 时，每个相册文件可作为 seed 数据单元

### 结论

TypeScript 数据文件**非常适合**这个场景。建议按相册拆分文件，每个文件不超过 15 张照片。

---

## 6. public/images 目录是否适合放照片

### 适合的原因

- Vite 的 `public/` 目录设计就是放静态资源的，构建时原样复制到 `dist/`
- GitHub Pages 直接托管这些静态文件，不需要额外的 CDN 或对象存储
- 目录结构清晰：`public/images/{albumId}/` 和路由 `/albums/:albumId` 自然对应
- 零成本

### 限制与风险

| 限制 | 说明 | 应对 |
|------|------|------|
| GitHub 单文件限制 100MB | 单张 RAW 照片可能超限 | 发布前压缩，JPEG 质量 85%，宽度 2000px 以内 |
| GitHub 仓库建议 1GB 以内 | 大量高分辨率照片可能触及 | 按 200 张照片 × 500KB = 100MB，远低于限制 |
| 克隆仓库会下载所有照片 | git clone 时下载全量历史 | 后续可考虑 Git LFS 或浅克隆 |
| 没有 CDN 加速 | 海外用户访问可能慢 | GitHub Pages 自带全球 CDN（Fastly），实际速度不差 |

### 实际操作建议

1. **发布前统一压缩照片**：建议尺寸 1600-2000px 宽，JPEG 80-85% 质量，单张控制在 300-800KB
2. **使用 `.gitignore` 排除原始文件**：如果有 RAW/PSD 等原始文件，不要提交到仓库
3. **考虑 Thumbnail**：如果照片墙需要缩略图（尤其是移动端），可以在 `public/images/` 下建 `thumb/` 子目录放压缩版

### 结论

对于个人摄影站的 MVP 阶段，`public/images/` **完全足够**。建议照片数量在 200 张以内，单张压缩到 800KB 以下。

---

## 7. 后续升级到 Supabase 版本是否方便

### 当前架构评估

当前方案的架构分层：

```
数据层：   src/data/albums.ts（内存常量，import 获取）
类型层：   src/types/index.ts（Album、Photo 接口定义）
组件层：   src/components/*.tsx + src/pages/*.tsx（通过 props 接收数据）
```

### 升级路径分析

**好消息：** 当前的数据模型设计已经和 Supabase 的范式对齐。

| 当前 TS 接口 | Supabase 表 | 映射关系 |
|-------------|-------------|---------|
| `Album` | `albums` 表 | 一对一，`id` 做主键 |
| `Photo` | `photos` 表（带 `album_id` 外键） | 一对一，`id` 做主键 |
| `ExifData`（隐式在 Photo 中） | `photos` 表的列 | 直接映射为表字段 |
| `SiteConfig` | `site_config` 表 | 单行配置表 |
| `public/images/` | Supabase Storage bucket | 路径映射 |

**需要改动的地方（极少）：**

| 改动 | 当前 | Supabase 版本 |
|------|------|-------------|
| 数据获取 | `import { albums } from '../data'` | `supabase.from('albums').select('*, photos(*)')'` |
| 图片路径 | 本地路径 + `import.meta.env.BASE_URL` | Supabase Storage public URL |
| 数据刷新 | 重新构建部署 | 实时（需要时加 realtime） |
| 新增内容 | 编辑 TS 文件 + git push | Supabase Dashboard / 管理后台 |
| 加载状态 | 无（数据 import 是同步的） | 需要 loading/error/empty 状态组件 |
| SSR/SSG | 不适用 | 可选的 Next.js / Astro 迁移 |

### 组件改动量分析

关键设计决策：**你的组件如果写成无状态（通过 props 接收数据），升级几乎不需要改组件。**

- ✅ `AlbumCard`、`PhotoWall`、`ExifPanel` 等组件通过 props 接收数据 → **升级时不需要改这些组件**
- ⚠️ 页面组件（`HomePage`、`AlbumDetailPage` 等）直接从 `albums.ts` import 数据 → **需要改成 `useEffect` + `useState` 获取数据**
- ⚠️ 需要新增加载态、错误态、空态组件 → **这是唯一需要新增的部分**

如果现在就把页面组件写成这样的模式，升级成本最小：

```tsx
// 当前版本 —— 数据是自己读的
function AlbumDetailPage() {
  const { albumId } = useParams();
  const album = albums.find(a => a.id === albumId); // 从静态数据文件读
  // ...
}

// 升级后 —— 把读数据的部分换成 async function
function AlbumDetailPage() {
  const { albumId } = useParams();
  const { data: album, loading, error } = useAlbum(albumId); // hook 内部调 Supabase
  // ... 组件其余逻辑不变
}
```

### 难点

1. **图片迁移**：从 `public/images/` 批量上传到 Supabase Storage。写个迁移脚本即可。
2. **Search/Filter**：如果以后要加搜索或标签筛选，需要 Supabase 的全文搜索或 pgvector，这个从静态数据迁移比较麻烦。

### 结论

**升级到 Supabase 的架构成本很低。** 前提是：
1. 组件通过 props 接收数据（现有设计已满足）
2. 页面组件的数据获取逻辑集中管理
3. 图片路径通过工具函数统一生成（方便切换源）

建议在开发静态版本时就**预留一个数据处理抽象层**，如：

```typescript
// src/services/data.ts
import { albums as staticAlbums } from '../data';

export function getAlbums() {
  return staticAlbums;
}

export function getAlbumById(id: string) {
  return staticAlbums.find(a => a.id === id);
}
```

后续升级到 Supabase 时，只需改这个文件内部的实现，所有页面组件不需要改动。

---

## 8. Codex 开发时必须提前提醒的坑

见下方 `CODEX_NOTES.md`。

---

## 总结

| 检查项 | 风险等级 | 推荐方案 |
|--------|---------|---------|
| Vite base 路径 | 🔴 高 | 条件 base，dev 用 `/`，prod 用 `/repo-name/` |
| React Router 刷新 404 | 🟡 中 | HashRouter |
| 图片路径 | 🔴 高 | 数据文件只存相对路径，用 `import.meta.env.BASE_URL` 拼接 |
| BrowserRouter vs HashRouter | 🟡 中 | HashRouter |
| TS 数据文件 | 🟢 低 | 按相册拆分文件 |
| public/images 目录 | 🟢 低 | 适合 MVP，注意压缩照片 |
| 升级 Supabase | 🟢 低 | 预留数据抽象层 |

**整体评价：技术方案可行，但 base 路径和图片路径两个陷阱不处理好，部署上线后会全站 404。**
