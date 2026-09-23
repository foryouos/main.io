# 瓶子的跋涉 · foryouos

个人主页（www.foryouos.cn）。纯 `HTML + CSS + JS`，零框架、零外部依赖，可直接部署到 Cloudflare Pages / GitHub Pages。

## 技术要点

- **背景是纯内联 SVG 手绘场景**：日出/星海、漂流瓶、三层海浪、云、海鸟、远山灯塔，全部由代码绘制，不引用任何外链图片或视频（旧版的超星云盘视频地址已失效、图床存在防盗链，故整体移除）。
- **昼夜双主题**：首次访问按本地时间自动判定（06:00–18:00 白天），点击右上角开关手动切换，结果写入 `localStorage`；支持 `?theme=night` 直达。
- **单屏不滚动**：`100dvh` + `overflow: hidden`，所有尺寸使用 `clamp()/vmin` 随视口缩放，不预留滑动交互。
- **丰富的动效**：星闪、流星、太阳光芒旋转、云朵漂移、海鸟振翅、三层海浪视差、鼠标视差、点击涟漪、公众号浮层的云朵呼吸。
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
index.html              # 页面结构 + 内联 SVG 场景
index.css               # 主题变量、场景动画、单屏布局
index.js                # 主题切换 / 一言 / 视差 / 涟漪 / viewBox 自适配 / 微信导引
og-cover.png            # 社交分享卡片 1200×630
wechat-card.png         # 「扫码 · 搜索联合传播样式（白色版）」导引图 1000×280（已裁掉自带白边）

# --- 站点图标（详见「站点图标」一节） ---
favicon.ico             # 16 + 32 + 48 三帧，站点根目录必需
favicon.svg             # 矢量源，现代浏览器优先取用
favicon-16x16.png       # 标签页 / 历史记录
favicon-32x32.png       # 标签页 / 书签
favicon-48x48.png       # ★ 搜索结果图标的最小可用尺寸
favicon-96x96.png       # 高分屏 / manifest
apple-touch-icon.png    # iOS 主屏 180×180（满幅无圆角，iOS 自行裁形）
mask-icon.svg           # Safari 固定标签页（单色，由 color 属性着色）
icon-192.png            # PWA / Android 主屏
icon-512.png            # PWA / Android 主屏（高分屏）
icon-maskable-512.png   # Android 自适应图标（内容已收进 80% 安全圆）
mstile-150x150.png      # Windows 开始菜单磁贴
site.webmanifest        # PWA 清单：名称 / 主题色 / 图标集
browserconfig.xml       # Windows 磁贴配置

robots.txt              # 抓取规则
sitemap.xml             # 站点地图
404.html                # 真实 404 页 —— 必须在根目录，否则 CF Pages 会启用 SPA 回退（见下）
```

## 导航入口

| 站点 | 地址 |
| --- | --- |
| 投资分析 InvestAnalyse | https://analyse.foryouos.cn/ |
| 博客 | https://www.blog.foryouos.cn/ |
| 搜索 | https://www.so.foryouos.cn/ |
| 公众号 | 微信搜一搜「瓶子的跋涉」（无外链，卡片本身不跳转） |

### 公众号卡片

第四张卡片是**微信公众号入口**（`.card-wx`），不跳转任何外部站点：

- 卡片是 `<div role="button" tabindex="0" aria-expanded aria-controls>`，而不是 `<a>`。点击/回车/空格只做浮层**开合**（disclosure 控件），不产生导航；`aria-expanded` 随状态同步。
- 图标为**官方微信公众号 logo**（Simple Icons 的 WeChat 路径，内联 SVG，24 视口），配色对齐「扫码_搜索联合传播样式」参考图——绿色气泡在前、浅灰气泡在后：

  - 官方路径是**单条 `path`**，子路径顺序为 `[大气泡, 眼1, 眼2, 小气泡, 眼3, 眼4]`。在第 4 个子路径处切开即可分别着色；该子路径原为相对指令 `m5.34 2.867`，需换算成绝对坐标 `M16.938 8.858`（`(11.598,5.991) + (5.34,2.867)`）。
  - 眼孔沿用官方 winding，`nonzero` 规则下自动成为**真正挖空的透明孔**，昼夜主题都成立。夜里 `--orb-bg` 是半透明色，若改用近似色"填充"眼孔，夜间眼孔会消失。
  - 图层顺序是「先画后层灰气泡、再画前层绿气泡」，两气泡交叠处由绿气泡覆盖，与参考图一致。
  - 官方 logo 是 24×18.9 的宽扁形，故 `.card-wx .orb svg` 按宽度对齐（44%），其余三枚图标为 46%。

  > 品牌绿 `#07C160` 是四张卡片里唯一的非橙/金色，有意为之：本卡片是公众号入口。若要回到单色体系，把 `.card-wx .orb .wx-mark-*` 的两条 `fill` 改为 `currentColor` 即可。

- 浮层内容就是那张参考图本身（`wechat-card.png`），不再拼装 HTML。卡片自带白色底，「白色版」样式在昼夜都保持浅底，否则二维码扫不出来。
- **导引图按内容包围盒裁到只剩 2px 余量**，自带白边全部去掉；四周留白改由 `.wx-pop` 的 `padding`（宽屏 26px / 窄屏 24px）统一提供。改前四边留白是「左 8 / 上 10 / 右 2 / 下 13」，右上角标题几乎贴边、像被裁掉。

  > 为什么不把白边裁到 0：二维码四周的白是**静默区**（标准要求 4 个模块）。按实测模块 ~2.88px 算，至少需要 ~11.5px。现在留白由云朵本体供给（云远大于图片），余量充足；但**窄屏（≤620px）云朵会被压扁，四角到图片的余量只剩约 3px**，所以那里的 `padding` 特意从 20px 提到 24px —— 否则 `cloud-bob` 的 ±3.5px 抖动会给图片直角边留出露脸的机会。

### 云朵浮层

浮层不再是「白色圆角矩形 + 小尖角」，而是**一朵向右飘出、与天空融为一体的白云**：

- **形状**：`.wx-cloud` 是一个内联 SVG，由「一个圆角主体 `rect` + 5 个 `ellipse` 鼓包」组成，全部同色 `fill: #FFFFFF`，并集即为云朵轮廓（与背景云同一套构造思路）。顶部 3 个鼓包给出蓬松感，底部只留主体的圆角边 —— **不额外加底部鼓包**：试过在底部叠一个比主体更宽的椭圆，交界处会出现明显的台阶。参考框 `1000×447` 与实际云盒（约 `452×202`）同比，故 `preserveAspectRatio="none"` 几乎无形变。
- **去白边靠"同色隐形"，不是抠图**：导引图背景是**纯白**（实测 41.5% 像素为 `#FFFFFF`，是该区域唯一的白）。云朵填充取同一个纯白、且比图片更大，图片的直角边与云朵底色完全一致，于是直边彻底消失，视觉上二维码就像印在云上。**云朵 fill 一旦偏离纯白（例如换成暖白），或图片被重新压缩出灰边，直角边会立刻显形。**
- **向右飘出**：`.wx-pop` 的 `right` 取 `calc(-1 * var(--wx-shift))`，把浮层整体推进卡片右侧的天空里：
  - `--wx-shift: max(0px, calc((100vw - 44rem) / 2 - 3.4vw - 6px))`。导航网格是**定宽居中**的，所以「卡片右缘 → 右侧安全边」的距离只与视口宽度有关，**不需要 JS 量测**。
  - **窄屏时该值为负，被 `max()` 收成 0**，云朵自动退回「右对齐卡片」的老行为，不会越出视口。
  - 实测 1424px 视口下云朵右缘距视口 44px；620px 窄屏下由 `right: 12px` 兜底。
- **浮层自身退成"纯容器"**：`.wx-pop` 现在是 `background: none; box-shadow: none`，形状与投影全交给 `.wx-cloud` 的 `filter: drop-shadow()`；原先的尖角（`.wx-pop::after`）已删除。
- **夜间有月光晕**：`html[data-theme="night"] .wx-cloud` 在 `drop-shadow` 外再叠一层 `rgba(184,216,255,.30)` 冷色外发光，让云像被月亮照亮，而不是一块贴上去的白。
- **呼吸感**：`cloud-bob` 让云极缓地上下浮动 ±3.5px（9s 一轮）；`prefers-reduced-motion` 下不取消、只放慢到 14s。

> **三个必须记住的坑（返工三次才收敛）**
>
> 1. **SVG 是替换元素，`width` 与 `height` 必须都显式给。** 只写 `top/bottom` 时，SVG 内在宽高比会**否决 `bottom`**，云朵下沿压住卡片；只写 `height` 时，内在宽高比反过来**定出宽度**，云朵被压窄、右侧漏出图片直边。正解：`width: calc(100% + var(--wx-side) * 2)` + `height: calc(100% + var(--wx-lift))` + `right: auto; bottom: auto`，再配 `preserveAspectRatio="none"` 拉伸。
> 2. **导引图要显式抬层级。** `.wx-cloud` 带 `filter`，会创建层叠上下文，绝对定位的云朵会盖在静态 `<img>` 之上、把二维码整块吃掉（表现是浮层一片白）。`.wx-shot` 必须 `position: relative; z-index: 1`。
> 3. **无头截图会偶发丢图。** Chrome `--screenshot` 的合成器有时不把 `<img>` 画进图层，出图是整块白。自检脚本要「出图 → 检测图片内容 → 失败重试（≤4 次）」，并加 `--run-all-compositor-stages-before-draw`。

| 交互 | 行为 |
| --- | --- |
| 桌面端悬浮 | CSS `:hover` / `:focus-visible` 展开，`0.28s` 淡入 + `0.38s` 上浮缩放 |
| 点击 / 回车 / 空格 | 切换固定展开（`is-open`），不跳转 |
| 关闭 | 点击卡片外部、`Escape`、`focusout`、窗口失焦 |
| 浮层内部 | 点导引图不会收起浮层（`stopPropagation`） |

两个实现细节：

- **浮层不能用 `position: fixed` 去贴合视口**：卡片带着 `fade-up` 入场动画，`animation-fill-mode: both` 会让 `transform` 残留为 `translateY(0)`——非 `none` 的 transform 会为 `fixed` 后代创建包含块，浮层会跑偏到卡片处而非视口居中。因此仍用 `position: absolute` 相对卡片定位，右移量交给 `--wx-shift`（见上）。**「向右飘出」在窄屏会自动退化为「右对齐卡片」，所以 500→1440px 全区间都不越出视口。**
- **透明接桥**：`.wx-pop::before` 是一段 22px 高的透明区域，填满云朵与卡片之间的 14px 空隙，确保指针从卡片移向二维码时不经过"真空带"（否则 `hover` 断掉、浮层消失）。接桥高度要**大于**实际间隙。


## 本地预览

```bash
# 方式一：直接双击 index.html
# 方式二：本地起服务（推荐，避免 file:// 下部分接口受限）
python -m http.server 8080
# 打开 http://localhost:8080
```

### 无头截图自检（改完动效/浮层后可跑）

Chrome 的 `--headless=new` 在本机可用，配合 `?theme=day|night` 可直接出图核对：

```bash
chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
  --virtual-time-budget=5000 --window-size=1440,900 \
  --screenshot=shot.png "file:///E:/Foryouos/main.io/index.html?theme=night"
```

两个坑：

1. **预览页必须放在仓库目录内**。放到临时目录时相对引用的 `index.css` 会 404，SVG 里靠 CSS 上色的云、山、海浪会全部退回黑色（内联渐变填色的星月仍正常），很容易误判成"样式炸了"。
2. **悬浮态截不到**。需要额外注入一段 `!important` 强制展开 `.wx-pop` 的 `<style>`，生成 `_preview.html` 后再截图（该文件已加入 `.gitignore`）。

还有三条与量测有关：

- **`--window-size` 有下限约 500px**。传 `420` 时布局视口会变成 500，而截图仍按 420 裁剪——右侧 80px 被切掉，看上去像"浮层溢出屏幕"。要判断是否真的溢出，用 `--dump-dom` 把 `getBoundingClientRect()` 打进 DOM 再读取，比截图目测可靠。
- **别用"一行连续白像素"去自动识别浮层**。窄屏时 SVG 云朵也是大块白色，会被误判成浮层。
- **`--dump-dom` 与 `--screenshot` 的布局视口差 `+16,+95`**。两边窗口尺寸要相应补偿，几何数据才能与出图对齐。

> 仓库内的 `_verify_cloud.py`（已 gitignore）把「宽屏白天 / 宽屏夜间 / 窄屏」三档的几何、接缝、遮挡、溢出、以及图片是否真的被画出来串成一条流水线，改完浮层直接跑它。

## 部署到 Cloudflare Pages

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**，选择本仓库。
2. 构建配置：
   - Framework preset：`None`
   - Build command：**留空**
   - Build output directory：`/`
3. 保存并部署，随后在 **Custom domains** 绑定 `www.foryouos.cn`。

> 纯静态、无构建步骤，也可以用 `wrangler pages deploy .` 直接上传，或继续使用 GitHub Pages（Settings → Pages → Deploy from branch → root）。

### ⚠️ 必须保留 `404.html`（否则全站「软 404」）

Cloudflare Pages 有个容易踩的默认行为：**项目根目录如果没有 `404.html`，Pages 会认定你在部署单页应用（SPA），把任何找不到的路径都回退到 `/`，并以 `200` 返回首页 HTML。**

由此产生两个后果：

1. **提交站点地图会失败，且报错误导**。若在 GSC 里把路径填错（例如填了 `sitemap` 少了 `.xml`、填了 `sitemap_index.xml`、或直接粘了首页地址），Pages 不会回 `404`，而是回首页 HTML。Google 于是报 **「Sitemap 为 HTML 檔案 / 第 2 行 標記：html」** —— 因为 `index.html` 第 2 行正是 `<html lang="zh-CN" …>`。报错信息指向的是首页，极易被误判成站点地图本身写坏了。
2. **无限「软 404」**。任意乱码路径都以 `200` 返回同一份首页，等于向爬虫声明"这些 URL 都存在"，浪费抓取预算，也稀释页面质量信号。

修复方式就是**在项目根目录放一个 `404.html`**：Pages 检测到它即关闭 SPA 回退，改为返回真实 `404` 状态码 + 该页内容。本站**没有任何客户端路由**（`index.js` 中 `pushState` / `hashchange` / `pathname` 计数均为 0），不存在需要回退的场景，加上只会更好。

本项目 `404.html` 的几个约束：

- **不依赖 JS、不依赖 `index.css`**：只用 `prefers-color-scheme` 做昼夜适配，任何情况下都能渲染。
- **所有资源引用一律绝对路径**：Pages 会用**原始 URL**（可能是 `/foo/bar` 这类深层路径）渲染 404 页，相对路径会解析到错误位置。
- **`noindex,follow`**：自身不进索引，但保留链接让爬虫走回首页。
- 视觉与首页一致（同一只漂流瓶、同一套暖橙/深海配色），并给出回首页与外站导航。

> **验证方法**：部署后访问 `https://www.foryouos.cn/no-such-page`，应返回 **404** 而非 200：`curl -sI https://www.foryouos.cn/no-such-page | head -1`

## SEO / 搜索引擎索引

已内置以下内容，**部署后无需额外配置即被抓取**：

| 项目 | 文件 / 位置 | 说明 |
| --- | --- | --- |
| 站点地图 | `sitemap.xml` | 首页 1 条，`lastmod` 记得随手更新 |
| 抓取规则 | `robots.txt` | 全站放行，逐一列出 Google / 百度 / Bing / 搜狗 / 360，并声明 sitemap |
| 404 处理 | `404.html` | 关闭 CF Pages 的 SPA 回退，返回真实 404（见「部署」一节） |
| 结构化数据 | `index.html` 内 JSON-LD | `WebSite` + `Person` + `ItemList`（站点导航），帮助搜索与 AI 摘要理解实体 |
| 标题与摘要 | `<title>` / `description` | 含"C/C++、后台服务器学习记录"等真实内容方向 |
| 抓取正文 | `.sr-only` 区块 | 视觉隐藏但爬虫与屏幕阅读器可见的正文（h1/h2 + 方向 + 导航），**与页面内容一致，非关键词堆砌** |
| 社交卡片 | `og-cover.png` 1200×630 | og:image / twitter:image |
| 站点图标 | `favicon.ico` + 6 个 PNG + `site.webmanifest` | 标签页、书签、**搜索结果**、移动端主屏 —— 见下节 |
| 无 JS 降级 | `<noscript>` | 未启用 JS 时输出可读正文与全部链接 |
| 重复内容防护 | `<link rel="canonical">` | `?theme=night` 等带参地址统一指向首页 |

> `.sr-only` 是「隐藏文本」的合规用法：内容真实描述页面、屏幕阅读器可读。若日后把这段内容改成视觉可见的独立区块（例如折叠面板），SEO 权重会更高。

### 站点图标（浏览器与搜索引擎的「标注文件」）

**症状**：搜索结果里站点名左侧显示默认的**灰色地球**，而不是本站图标。

**根因**：`<head>` 里只声明了 `type="image/svg+xml"` 的 favicon。图标抓取器只认 `favicon.ico` 与**位图**（PNG），且要求尺寸是 48×48 的整数倍；只给 SVG 时它取不到任何可用资源，于是退回占位地球。

**修复**：在站点根目录补齐 `favicon.ico`（16/32/48 三帧）+ 位图 PNG，并在 `<head>` 里逐级声明：

| 声明 | 作用域 |
| --- | --- |
| `rel="icon" href="favicon.ico" sizes="16x16 32x32 48x48"` | 兜底；抓取器会直接请求 `/favicon.ico` |
| `rel="icon" type="image/png" sizes="48x48"` | **搜索结果图标**（48 的整数倍，48 / 96 均可） |
| `rel="icon" type="image/png" sizes="16x16"` / `32x32` | 标签页、书签、历史记录 |
| `rel="icon" type="image/svg+xml"` | 现代浏览器的矢量优先项 |
| `rel="apple-touch-icon" sizes="180x180"` | iOS 添加到主屏 |
| `rel="mask-icon" color="#FF9418"` | Safari 固定标签页 |
| `rel="manifest"` + `browserconfig.xml` | Android 主屏 / Windows 磁贴 |

三条硬性要求，缺一条图标仍会被忽略：

1. **`favicon.ico` 必须在站点根目录**，且 `robots.txt` 不得屏蔽它 —— 抓取器按 `/favicon.ico` 这个固定路径去取。
2. **尺寸为 48×48 的整数倍、正方形、同域可直接访问**（不能挂到另一个域名的图床/CDN 上）。
3. **换图标后要主动触发重新抓取**（Search Console「网址检查」→ 请求编入索引）。搜索引擎侧的图标缓存刷新**通常滞后数天到数周**，不是改完即刻生效。

> **生成方式**：`favicon.svg` 经无头 Chrome 渲染成 1024×1024 透明母图，再 LANCZOS 逐级降采样；16/32/48 追加一道轻度 USM 锐化，最后手工拼装 ICO 容器（免得 PIL 从单张源图重新缩放、丢掉锐化结果，也便于确认三帧尺寸）。`icon-maskable-512.png` 是**单独一版**：满幅渐变底 + 抠出的瓶子按 80% 安全圆缩放居中。
>
> **两个坑**：① Chrome 无头截图的布局视口有约 500px 下限，`--window-size=16,16` 只会截到大图的左上角 —— 必须先渲染大图再降采样。② 别直接拿方形图标当 maskable，启动器的圆形遮罩会把瓶底切掉。

### 部署后要做的事（一次性）

1. **Google Search Console** — 添加资源 `https://www.foryouos.cn/`，验证（已有 `google-site-verification` meta），提交 `sitemap.xml`，用"网址检查"请求编入索引。**换过图标后要再抓一次**，并接受图标缓存有数天到数周的延迟。
   - 提交框里**填路径 `sitemap.xml` 即可**，不要粘首页地址、也不要写成 `sitemap_index.xml`。
   - 若报 **「Sitemap 为 HTML 檔案 / 第 2 行 標記：html」**，即命中了上一节的 SPA 回退陷阱：先确认根目录有 `404.html` 并已部署，再删掉那条错误记录重新提交。
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
