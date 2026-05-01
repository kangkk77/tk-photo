# T&K Photo 开发规则

请先阅读以下四个文件，再开始写代码：

1. PROJECT_PLAN.md
2. VISUAL_DESIGN.md
3. TECH_REVIEW.md
4. CODEX_NOTES.md

项目目标：
开发一个 GitHub Pages 静态版摄影作品展示网站，技术栈为 Vite + React + TypeScript + Tailwind CSS + Framer Motion + react-router-dom。

第一版只做静态展示，不做登录、数据库、在线上传、Supabase、后台管理。

必须遵守：
1. 使用 HashRouter。
2. Vite base 使用生产环境和开发环境区分。
3. 图片路径不要写成 /images/xxx，数据文件只存 albumId/fileName，通过 getImagePath 拼接 import.meta.env.BASE_URL。
4. 照片不能圆角，不能阴影，不能强制裁切。
5. 视觉风格必须是线上摄影展，关键词是留白、克制、质感、叙事。
6. 第一轮只做项目骨架，不要一次性完成整个网站。
7. 每次完成后必须运行 npm run build。