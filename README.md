# Muntrie Site

这是放在主仓库里的自包含静态官网目录，当前实现不依赖 Flutter、Node 或额外构建链。

当前站点包含：

- 官网首页
- 关于我们页
- 支持页
- 隐私政策页
- 使用条款页
- 中英文双语文案
- 跟随系统语言自动切换，默认英文
- iOS / Android 下载二维码占位卡

## 为什么现在适合同仓维护

- 官网体量还小，和 app 共用品牌、场景素材、产品文案与发布节奏。
- 同一个 PR 可以同时更新产品能力和官网描述，避免“双仓不同步”。
- `site/` 自包含后，继续同仓并不会影响后续单独部署。

## 什么时候再考虑拆仓

- 官网开始依赖 CMS、SSR、A/B 实验或单独的前端基础设施。
- 官网团队和 app 团队的发布节奏明显分离。
- 官网规模增长到需要独立依赖管理、测试矩阵和部署流水线。

如果只是品牌站、下载落地页、功能说明页，同仓维护通常是更省心的方案。

## 目录说明

- `site/index.html`: 官网首页骨架
- `site/about.html`: 关于、运营方式与公开联系渠道页
- `site/support.html`: 产品支持、计费、隐私、安全与法务联系入口
- `site/privacy.html`: 隐私政策页
- `site/terms.html`: 使用条款页
- `site/config.js`: 商店链接、联系邮箱、公司名占位配置
- `site/content.js`: 中英文文案源与法律页结构化内容
- `site/styles.css`: 视觉系统与响应式布局
- `site/script.js`: 语言切换、内容渲染、live clock 与 reveal
- `site/assets/`: 官网专用素材、二维码占位图、字体与场景图

## 本地预览

在仓库根目录运行：

```bash
cd site
python3 -m http.server 4173
```

然后打开 `http://localhost:4173`。

## 后续接入建议

- 商店链接、支持邮箱、法务联系信息：直接补到 `site/content.js` 或页面结构中
- 正式上线前，先修改 `site/config.js` 里的公司名、支持邮箱、隐私邮箱与 iOS/Android 下载链接
- 将 `site/assets/icons/qr-ios-placeholder.svg` 和 `site/assets/icons/qr-android-placeholder.svg` 替换成最终二维码
- 如果你后面想接 GitHub Pages / Netlify / Vercel，这个目录可以直接作为部署根目录
- 如果后面文案继续增多，建议把 `site/content.js` 再拆成按页面分离的内容文件
