# T&K Photo

T&K Photo 是一个部署在 GitHub Pages 上的静态摄影作品展示网站。网站以线上摄影展的方式组织内容，包含相册列表、展览式照片墙、单张作品详情页，以及克制的 EXIF 信息面板。

线上地址：
- `https://kangkk77.github.io/tk-photo/`

## 项目介绍

这个项目的目标不是做普通相册，而是做一个静态、克制、带有策展感的线上摄影展。当前版本以真实照片和静态数据为核心，不包含登录、数据库、上传或后台管理。

## 技术栈

- Vite
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- `react-router-dom`
- GitHub Pages
- GitHub Actions

## 本地运行

环境要求：
- Node.js 20 或更高版本
- npm

安装依赖：

```bash
npm ci
```

启动开发环境：

```bash
npm run dev
```

本地开发环境的 `base` 为 `/`。

## 构建方式

执行生产构建：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

生产环境的 `base` 为 `/tk-photo/`。

## 部署方式

项目使用 GitHub 官方 Pages Actions 工作流，配置文件位于：
- [.github/workflows/deploy.yml](/E:/T&K_photo/.github/workflows/deploy.yml)

部署流程：
- 推送代码到 `main` 分支
- GitHub Actions 执行 `npm ci`
- GitHub Actions 执行 `npm run build`
- 将 `dist/` 上传为 GitHub Pages artifact
- 使用 `actions/deploy-pages` 发布站点

仓库设置：
- 打开 `Settings -> Pages`
- 将 `Source` 设置为 `GitHub Actions`

## 项目结构

主要目录说明：
- `src/components`：可复用组件
- `src/pages`：路由页面
- `src/data`：站点数据和相册数据
- `src/types`：TypeScript 类型定义
- `src/utils`：辅助函数，例如图片路径处理
- `public/images`：相册图片资源
- `.github/workflows`：部署工作流

## 如何新增相册

1. 在 `public/images` 下创建新的相册目录，例如 `public/images/new-album`
2. 将封面图和相册图片放入该目录
3. 打开 [src/data/albums.ts](/E:/T&K_photo/src/data/albums.ts)
4. 在 `albums` 数组中新增一个 `Album` 对象
5. 至少填写以下字段：
   - `id`
   - `title`
   - `subtitle`
   - `description`
   - `coverImage`
   - `theme`
   - `date`
   - `location`
   - `photos`
6. `coverImage` 必须写成相对路径片段，例如 `new-album/cover.jpg`
7. 完成后运行 `npm run build`

## 如何新增照片

1. 将新照片放入对应的 `public/images/{albumId}/` 目录
2. 打开 [src/data/albums.ts](/E:/T&K_photo/src/data/albums.ts)
3. 找到对应相册，在 `photos` 数组中新增一个 `Photo` 对象
4. 至少填写以下字段：
   - `id`
   - `albumId`
   - `title`
   - `description`
   - `image`
   - `date`
   - `location`
   - `camera`
   - `lens`
   - `aperture`
   - `shutterSpeed`
   - `iso`
   - `focalLength`
   - `orientation`
   - `layout`
5. 完成后运行 `npm run build`

## 图片路径规则

必须这样做：
- 数据文件里只保存相对路径片段
- 示例：`stone-and-eaves/pagoda-rise.jpg`
- 页面组件里统一通过 [getImagePath](/E:/T&K_photo/src/utils/paths.ts) 生成最终图片 URL

不要这样做：
- 不要写 `/images/stone-and-eaves/pagoda-rise.jpg`
- 不要写 `images/stone-and-eaves/pagoda-rise.jpg`
- 不要在 `albums.ts` 里手动拼接 `import.meta.env.BASE_URL`

原因：
- GitHub Pages 部署在 `/tk-photo/` 子路径下，图片地址必须根据运行环境动态生成

## 路由说明

- 项目使用 `HashRouter`
- 这样可以避免 GitHub Pages 下子路由刷新出现 404
- 线上 URL 使用 `#/` 格式

## 内容维护说明

- 相册和照片数据维护在 [src/data/albums.ts](/E:/T&K_photo/src/data/albums.ts)
- 站点级信息维护在 [src/data/site.ts](/E:/T&K_photo/src/data/site.ts)
- 真实照片的 EXIF 提取报告保存在 [EXIF_REPORT.md](/E:/T&K_photo/EXIF_REPORT.md)

## Scripts

- `npm run dev`：启动 Vite 开发服务器
- `npm run build`：执行 TypeScript 构建和 Vite 生产构建
- `npm run preview`：本地预览生产构建结果
- `npm run lint`：运行 ESLint
