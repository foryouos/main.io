# 瓶子的跋涉 · foryouos

个人主页（www.foryouos.cn）。纯 `HTML + CSS + JS`，零框架、零外部依赖，可直接部署到 Cloudflare Pages / GitHub Pages。

## 技术要点

- **背景是纯内联 SVG 手绘场景**：日出/星海、漂流瓶、三层海浪、云、海鸟、远山灯塔，全部由代码绘制，不引用任何外链图片或视频（旧版的超星云盘视频地址已失效、图床存在防盗链，故整体移除）。
- **昼夜双主题**：首次访问按本地时间自动判定（06:00–18:00 白天），点击右上角开关手动切换，结果写入 `localStorage`；支持 `?theme=night` 直达。
- **单屏不滚动**：`100dvh` + `overflow: hidden`，所有尺寸使用 `clamp()/vmin` 随视口缩放，不预留滑动交互。
- **丰富的动效**：星闪、流星、太阳光芒旋转、云朵漂移、海鸟振翅、三层海浪视差、鼠标视差、点击涟漪。
- **三个主角各有动作**（每层动画拆成独立的 `<g>`，位移与形变互不覆盖）：
  - 帆船：`boat-drift` 在海平线附近巡航往返 ±150px（34s 一轮），`boat-bob` 负责起伏与 ±3.2° 倾侧。
  - 漂流瓶：`bottle-drift` 横向漂移 ±72px（21s 往返），`bottle-move` 负责起伏 25px 与 ±4.8° 摇晃，另带眨眼与表情摆动。
  - 海中灯塔：白天灯芯熄灭、无光束，塔身红白条纹清晰；入夜灯芯点亮并有光晕脉动，双向光束左右扫射（±26°，12s），水面出现灯影。岸边那座灯塔同样只在夜间闪烁。

> **动效设计红线**：主角必须"开屏即在视野内"。曾把帆船的位移起点放到画面外（避免循环时瞬移），结果加载后十几秒看不到船，被判断为"没有动"。位移幅度同理——低于约 15px/s 的位移肉眼基本无感。
>
> **`prefers-reduced-motion` 策略**：只关闭闪烁、扫射、视差、涟漪，**保留**海浪、帆船、漂流瓶的慢速运动。若沿用"全站 `animation-duration: .001ms`"的一刀切写法，系统关闭动画的用户会看到一张完全静止的图。
>
> **缓存击穿**：`index.html` 中引用的是 `index.css?v=N` / `index.js?v=N`。**每次改样式或脚本后把 `N` 加一**，否则浏览器与预览面板可能继续用旧文件，改动"看不到"。
- **稳健降级**：一言接口连续失败 3 次即切换为内置文案轮播；`prefers-reduced-motion` 下关闭动效。

## 文件结构

```
index.html      # 页面结构 + 内联 SVG 场景
index.css       # 主题变量、场景动画、单屏布局
index.js        # 主题切换 / 一言 / 视差 / 涟漪 / viewBox 自适配
favicon.svg     # 内联矢量图标（漂流瓶）
```

## 导航入口

| 站点 | 地址 |
| --- | --- |
| 投资分析 InvestAnalyse | https://analyse.foryouos.cn/ |
| 博客 | https://www.blog.foryouos.cn/ |
| 搜索 | https://www.so.foryouos.cn/ |
| GitHub | https://github.com/foryouos |

## 本地预览

```bash
# 方式一：直接双击 index.html
# 方式二：本地起服务（推荐，避免 file:// 下部分接口受限）
python -m http.server 8080
# 打开 http://localhost:8080
```

## 部署到 Cloudflare Pages

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**，选择本仓库。
2. 构建配置：
   - Framework preset：`None`
   - Build command：**留空**
   - Build output directory：`/`
3. 保存并部署，随后在 **Custom domains** 绑定 `www.foryouos.cn`。

> 纯静态、无构建步骤，也可以用 `wrangler pages deploy .` 直接上传，或继续使用 GitHub Pages（Settings → Pages → Deploy from branch → root）。

## SEO / 搜索引擎索引

已内置以下内容，**部署后无需额外配置即被抓取**：

| 项目 | 文件 / 位置 | 说明 |
| --- | --- | --- |
| 站点地图 | `sitemap.xml` | 首页 1 条，`lastmod` 记得随手更新 |
| 抓取规则 | `robots.txt` | 全站放行，逐一列出 Google / 百度 / Bing / 搜狗 / 360，并声明 sitemap |
| 结构化数据 | `index.html` 内 JSON-LD | `WebSite` + `Person` + `ItemList`（站点导航），帮助搜索与 AI 摘要理解实体 |
| 标题与摘要 | `<title>` / `description` | 含"C/C++、后台服务器学习记录"等真实内容方向 |
| 抓取正文 | `.sr-only` 区块 | 视觉隐藏但爬虫与屏幕阅读器可见的正文（h1/h2 + 方向 + 导航），**与页面内容一致，非关键词堆砌** |
| 社交卡片 | `og-cover.png` 1200×630 | og:image / twitter:image，另作 apple-touch-icon |
| 无 JS 降级 | `<noscript>` | 未启用 JS 时输出可读正文与全部链接 |
| 重复内容防护 | `<link rel="canonical">` | `?theme=night` 等带参地址统一指向首页 |

> `.sr-only` 是「隐藏文本」的合规用法：内容真实描述页面、屏幕阅读器可读。若日后把这段内容改成视觉可见的独立区块（例如折叠面板），SEO 权重会更高。

### 部署后要做的事（一次性）

1. **Google Search Console** — 添加资源 `https://www.foryouos.cn/`，验证（已有 `google-site-verification` meta），提交 `sitemap.xml`，用"网址检查"请求编入索引。
2. **Bing Webmaster Tools** — 支持从 GSC 直接导入；`bingbot` 已在 robots 中放行。
3. **百度搜索资源平台** — 验证（已有 `baidu-site-verification` meta），提交 `sitemap.xml` 或使用普通收录 API 推送首页。
4. **搜狗 / 360 站长平台** — 在 `<head>` 的注释位置补各自的验证 meta。
5. **社交预览自检** — 部署后确认 `https://www.foryouos.cn/og-cover.png` 可访问，用 Facebook Sharing Debugger / Twitter Card Validator 刷新缓存。

### 子域名是独立工程

`sitemap.xml` 只能收录**同一主机**的地址。`analyse` / `blog` / `so` 三个子域需要各自部署 `robots.txt` 与 `sitemap.xml`，并在各站长平台单独验证后提交；本页只负责把它们作为导航入口暴露给爬虫。

## 约定

- 外部资源一律不引入，避免防盗链与失效风险；需要图形就用 SVG 画。
- 尺寸统一使用 `clamp()` / `vmin`，保证一屏内完整呈现。
- 新增动效前先确认不与既有 `transform` 冲突：**CSS `transform` 会覆盖 SVG 元素上的 `transform` 属性**，定位与动画必须分层到不同的 `<g>`。
