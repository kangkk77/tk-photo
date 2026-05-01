# Codex 开发注意事项

> 在开始写任何代码之前，请先读完本文。以下每个坑都在 GitHub Pages 上真实出现过。

---

## 坑 1：Vite base 路径不是写死的

**错误做法：**
```typescript
// vite.config.ts
export default defineConfig({
  base: '/tk-photo/',  // 本地 npm run dev 时路径全错
});
```

**正确做法：**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/tk-photo/' : '/',
}));
```

`npm run dev` 是 development mode，`npm run build` 是 production mode，GitHub Actions 构建时自动就是 production mode。

---

## 坑 2：必须用 HashRouter，不是 BrowserRouter

**Router 选择：**

```tsx
// ✅ 正确：HashRouter，GitHub Pages 上刷新永远不会 404
import { HashRouter } from 'react-router-dom';

function App() {
  return (
    <HashRouter>
      <Routes>...</Routes>
    </HashRouter>
  );
}
```

```tsx
// ❌ 错误：BrowserRouter，刷新 /albums/xxx 直接 404
import { BrowserRouter } from 'react-router-dom';
```

路由的其他代码（`Route`、`Link`、`useParams`、`useNavigate`）写法完全不变。

---

## 坑 3：图片路径不能写绝对路径

**这是上线后最容易炸的坑。**

**错误做法：**
```typescript
// src/data/albums.ts
{
  image: '/images/golden-coast/sunset-rock.jpg',  // ❌ GitHub Pages 上 404
}
```

浏览器看到 `<img src="/images/...">` 会去 `https://username.github.io/images/...` 找文件，但文件在 `https://username.github.io/tk-photo/images/...`。

**正确做法：**

```typescript
// 第一步：数据文件只存相对路径片段（不带前导 /）
// src/data/albums.ts
{
  image: 'golden-coast/sunset-rock.jpg',  // 只存 albumId/filename
}
```

```typescript
// 第二步：写一个工具函数统一拼接路径
// src/utils/paths.ts
export function getImagePath(relativePath: string): string {
  if (!relativePath) return '';
  return `${import.meta.env.BASE_URL}images/${relativePath}`;
}
```

```tsx
// 第三步：所有用到图片的地方都用这个函数
<img src={getImagePath(photo.image)} alt={photo.title} />
```

**原理：** `import.meta.env.BASE_URL` 在 Vite 构建时会被替换为 `base` 配置的值：
- 本地 dev：`/`
- 生产构建：`/tk-photo/`

这样拼接出的路径永远正确。

**⚠️ 封面图也要这样处理**（`coverImage` 字段）。

---

## 坑 4：字体引入不需要改

Google Fonts 的外部 URL **不受** base 影响，直接用：

```css
/* src/styles/global.css */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Noto+Serif+SC:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

如果在 `public/` 放本地字体文件，就需要用 `import.meta.env.BASE_URL`，但当前方案全部用 Google Fonts 外部加载，不存在这个问题。

---

## 坑 5：404.html 处理（仅用 BrowserRouter 时需要，用 HashRouter 则跳过）

如果坚持用 BrowserRouter，需要以下额外配置。**如果已采纳 HashRouter，本节跳过不读。**

`public/404.html`：
```html
<!DOCTYPE html>
<html>
<meta charset="utf-8">
<script>
  sessionStorage.redirect = location.pathname + location.search + location.hash;
  location.replace('/tk-photo/');
</script>
</html>
```

⚠️ 注意：`location.replace` 的目标路径必须是**你的仓库名**（如 `/tk-photo/`），不能用 `/`。

`index.html` 中在 `</body>` 前额外加：
```html
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

---

## 坑 6：GitHub Actions deploy.yml 需要 Vite 正确输出

```yaml
# .github/workflows/deploy.yml
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

注意：`cache: 'npm'` 需要仓库根目录有 `package-lock.json`。

---

## 坑 7：数据文件中不要 import 任何浏览器 API

`src/data/albums.ts` 只是纯数据，Vite 构建时它不会被打包成单独文件，而是树摇进使用它的组件里。所以这里**不能** import `import.meta.env`，那在模块顶层不是运行时可用。

这就是为什么坑 3 中，数据文件只存片段，在组件/工具函数中做路径拼接。

---

## 坑 8：GitHub Pages 仓库设置

部署到 GitHub Pages 后，进入仓库的 **Settings → Pages**：
- Source 选 **GitHub Actions**
- 不需要选分支（Actions 自动处理）
- 等待 Actions 运行完成后，访问 `https://<username>.github.io/<repo-name>/`

如果访问后页面空白，F12 看 Console：
- JS 404 → base 路径配置错误（坑 1）
- 图片 404 → 图片路径错误（坑 3）
- 路由 404 → 用了 BrowserRouter（坑 2）

---

## 坑 9：图片尺寸和压缩

GitHub 限制：
- 单文件 ≤ 100MB
- 仓库推荐 ≤ 1GB

建议标准：
- 展示图片宽度 1600-2000px
- JPEG 质量 80-85%
- 单张控制在 300-800KB
- 200 张照片 = 约 60-160MB，安全

**不要**把 RAW/PSD/TIFF 文件放进仓库。在 `public/images/` 下建一个 `.gitkeep` 而不是 `README.md`（避免额外文件干扰）。

---

## 坑 10：Framer Motion 在移动端

Framer Motion 的 `whileHover` 在触摸设备上不会触发（没有 hover）。需要用 `whileTap` 或检测触摸设备。

```tsx
// 简单处理：移动端不加 hover 效果
<motion.div
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.4 }}
>
```

`whileTap` 在桌面和移动端都工作，可以作为 hover 的降级。

---

## 坑 11：React Router 嵌套路由和 Layout

Layout 组件用 `<Outlet />` 渲染子路由。确保 Layout 不在 HashRouter 外面。

```tsx
// ✅ 正确
<HashRouter>
  <Routes>
    <Route element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="albums" element={<AlbumListPage />} />
      <Route path="albums/:albumId" element={<AlbumDetailPage />} />
      <Route path="albums/:albumId/:photoId" element={<PhotoDetailPage />} />
      <Route path="about" element={<AboutPage />} />
    </Route>
  </Routes>
</HashRouter>
```

注意：在 HashRouter 下，`<Link to="/albums">` 和 `<Link to="albums">` 行为相同，但推荐用相对路径 `to="albums"` 避免潜在问题。

---

## 坑 12：Tailwind 深色模式

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',  // 不要用 'media'，否则用户无法手动切换
  // ...
}
```

```css
/* src/styles/global.css */
:root {
  --bg-primary: #FAFAF8;
  --bg-secondary: #F2F0EC;
  --text-primary: #1A1A1A;
  --text-secondary: #6B6B6B;
  --text-muted: #A0A0A0;
  --accent: #8B7355;
  --border: #E8E4DE;
}

.dark {
  --bg-primary: #1A1A1A;
  --bg-secondary: #242424;
  --text-primary: #F0EDE8;
  --text-secondary: #9A9A9A;
  --text-muted: #666666;
  --accent: #C4A87A;
  --border: #333333;
}
```

在 `useTheme` hook 中，给 `<html>` 元素加/移除 `dark` class：
```typescript
document.documentElement.classList.toggle('dark', isDark);
```

Tailwind 使用：
```html
<div class="bg-[var(--bg-primary)] text-[var(--text-primary)]">
```

---

## 检查清单（部署前逐条核对）

- [ ] `vite.config.ts` 的 `base` 是条件判断（dev `/`, prod `/<repo-name>/`）
- [ ] 使用了 `HashRouter`
- [ ] 所有图片路径通过 `getImagePath()` 工具函数生成
- [ ] 数据文件中 `image` 字段只存相对片段（不带前导 `/`）
- [ ] `npm run build` 成功，无 TS 错误
- [ ] `npm run dev` 本地所有页面可访问
- [ ] GitHub Actions deploy.yml 已创建
- [ ] GitHub Pages Settings 已选 "GitHub Actions"
- [ ] 部署后访问全站无 404 或空白页
- [ ] 深色/浅色主题切换正常
- [ ] 移动端布局无横向溢出
